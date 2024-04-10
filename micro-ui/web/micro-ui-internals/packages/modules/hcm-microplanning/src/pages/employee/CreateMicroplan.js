import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { timeLineOptions } from "../../configs/timeLineOptions.json";
import Upload from "./Upload";
import Hypothesis from "./Hypothesis";
import RuleEngine from "./RuleEngine";
import Mapping from "./Mapping";
import Navigator from "../../components/Nagivator";
import { v4 as uuidv4 } from "uuid";
import { Toast } from "@egovernments/digit-ui-components";

export const components = {
  Upload,
  Hypothesis,
  RuleEngine,
  Mapping
};

// will be changed laters
const MicroplanName = "microplan 1912";
const campaignType = "ITIN";

// Main component for creating a microplan
const CreateMicroplan = () => {
  // Fetching data using custom MDMS hook
  const { isLoading, data } = Digit.Hooks.useCustomMDMS("mz", "hcm-microplanning", [{ name: "UIConfiguration" }]);
  const { mutate: CreateMutate } = Digit.Hooks.microplan.useCreatePlanConfig();
  const { mutate: UpdateMutate } = Digit.Hooks.microplan.useUpdatePlanConfig();
  const { t } = useTranslation();

  // States
  const [microplanData, setMicroplanData] = useState();
  const [operatorsObject, setOperatorsObject] = useState([]);
  const [toastCreateMicroplan, setToastCreateMicroplan] = useState();
  const [checkForCompleteness, setCheckForCompletion] = useState([]);
  // useEffect to initialise the data from MDMS
  useEffect(() => {
    let temp;
    if (!data || !data["hcm-microplanning"]) return;
    let UIConfiguration = data["hcm-microplanning"]["UIConfiguration"];
    if (UIConfiguration) temp = UIConfiguration.find((item) => item.name === "ruleConfigure");
    if (!(temp && temp.ruleConfigureOperators)) return;
    setOperatorsObject(temp.ruleConfigureOperators);
  }, [data]);

  // useEffect to store data in session storage
  useEffect(() => {
    if (!microplanData) return;
    Digit.SessionStorage.set("microplanData", microplanData);
  }, [microplanData]);

  // useEffect to store data in session storage
  useEffect(() => {
    const data = Digit.SessionStorage.get("microplanData");
    let statusData = {};
    let toCheckCompleteness = [];
    timeLineOptions.forEach((item) => {
      statusData[item.name] = false;
      if (item?.checkForCompleteness) toCheckCompleteness.push(item.name);
    });
    if (data && data?.status && Object.keys(data?.status) === 0) setCheckForCompletion(toCheckCompleteness);
    setMicroplanData({ ...data, status: statusData });
  }, []);

  // An addon function to pass to Navigator
  const nextEventAddon = useCallback(
    async (currentPage, checkDataCompletion) => {
      if (!microplanData) return;
      setMicroplanData((previous) => ({
        ...previous,
        status: { ...previous?.status, [currentPage?.name]: checkDataCompletion === "valid" ? true : false },
      }));
      if (currentPage?.name !== "FORMULA_CONFIGURATION") return;
      let checkStatusValues = microplanData?.status || {};
      checkStatusValues["FORMULA_CONFIGURATION"] = true;
      let check = true;
      for (let data of checkForCompleteness) {
        check = check && checkStatusValues[data];
      }
      if (!check) return;
      let body = mapDataForApi(microplanData, operatorsObject);
      if (microplanData && !microplanData.planConfigurationId) {
        createPlanConfiguration(body);
      } else if (microplanData && microplanData.planConfigurationId) {
        updatePlanConfiguration(body);
      }
    },
    [microplanData, UpdateMutate, CreateMutate]
  );

  const createPlanConfiguration = async (body) => {
    await CreateMutate(body, {
      onSuccess: async (data) => {
        setMicroplanData((previous) => ({
          ...previous,
          planConfigurationId: data?.PlanConfiguration[0]?.id,
          auditDetails: data?.PlanConfiguration[0]?.auditDetails,
        }));
        setToastCreateMicroplan({ state: "success", message: t("SUCCESS_DATA_SAVED") });
        setTimeout(() => {
          setToastCreateMicroplan(undefined);
        }, 2000);
      },
      onError: (error, variables) => {
        setToastCreateMicroplan({
          message: t("ERROR_DATA_NOT_SAVED"),
          state: "error",
        });
        setTimeout(() => {
          setToastCreateMicroplan(undefined);
        }, 2000);
      },
    });
  };

  const updatePlanConfiguration = async (body) => {
    body.PlanConfiguration["id"] = microplanData?.planConfigurationId;
    body.PlanConfiguration["auditDetails"] = microplanData?.auditDetails;
    await UpdateMutate(body, {
      onSuccess: async (data) => {
        setToastCreateMicroplan({ state: "success", message: t("SUCCESS_DATA_SAVED") });
        setTimeout(() => {
          setToastCreateMicroplan(undefined);
        }, 2000);
      },
      onError: (error, variables) => {
        setToastCreateMicroplan({
          message: t("ERROR_DATA_NOT_SAVED"),
          state: "error",
        });
        setTimeout(() => {
          setToastCreateMicroplan(undefined);
        }, 2000);
      },
    });
  };

  const setCurrentPageExternally = useCallback(
    (props) => {
      switch (props.method) {
        case "set":
          let currentPage;
          const data = Digit.SessionStorage.get("microplanData");
          if (data && data?.currentPage) currentPage = data.currentPage;
          if (currentPage && props && props?.setCurrentPage && timeLineOptions.find((item) => item.id === currentPage?.id)) {
            props.setCurrentPage(currentPage);
            return true;
          }
          break;
        case "save":
          if (props && props.currentPage) {
            setMicroplanData((previous) => ({ ...previous, currentPage: props.currentPage }));
          }
          break;
      }
    },
    [microplanData, setMicroplanData, Navigator]
  );

  return (
    <div className="create-microplan">
      <Navigator
        config={timeLineOptions}
        checkDataCompleteness={true}
        stepNavigationActive={true}
        components={components}
        childProps={{ microplanData, setMicroplanData, campaignType }}
        nextEventAddon={nextEventAddon}
        setCurrentPageExternally={setCurrentPageExternally}
      />

      {toastCreateMicroplan && toastCreateMicroplan.state === "success" && (
        <Toast style={{ bottom: "5.5rem" }} label={toastCreateMicroplan.message} onClose={() => setToastCreateMicroplan(undefined)} />
      )}
      {toastCreateMicroplan && toastCreateMicroplan.state === "error" && (
        <Toast style={{ bottom: "5.5rem" }} label={toastCreateMicroplan.message} onClose={() => setToastCreateMicroplan(undefined)} error />
      )}
    </div>
  );
};

const mapDataForApi = (data, Operators) => {
  // Generate UUID
  const uuid = uuidv4();
  // return a Create API body
  return {
    PlanConfiguration: {
      tenantId: Digit.ULBService.getStateId(),
      name: MicroplanName,
      executionPlanId: uuid,
      files: Object.values(data?.upload).map((item) => ({
        filestoreId: item.filestoreId,
        inputFileType: item.fileType,
        templateIdentifier: item.section,
      })),
      assumptions: data?.hypothesis?.map((item) => {
        let templist = JSON.parse(JSON.stringify(item));;
        delete templist.id;
        return templist;
      }),
      operations: data?.ruleEngine?.map((item) => {
        const data = JSON.parse(JSON.stringify(item));
        delete data.id;
        const operator = Operators.find((e) => e.name === data.operator);
        if (operator && operator.code) data.operator = operator?.code;
        return data;
      }),
      resourceMapping: Object.values(data?.upload)
        .map((item) => item.resourceMapping)
        .flatMap((inner) => inner),
    },
  };
};

export default CreateMicroplan;
