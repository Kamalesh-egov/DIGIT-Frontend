import React, { Fragment, useState, useEffect, useCallback } from "react";
import {
  Card,
  CardSubHeader,
  CardSectionHeader,
  StatusTable,
  Row,
  Loader,
  LabelFieldPair,
  CardLabel,
  TextInput,
} from "@egovernments/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { tourSteps } from "../configs/tourSteps";
import { useMyContext } from "../utils/context";
import { Modal, Toast } from "@egovernments/digit-ui-components";
import { CloseButton, ModalHeading } from "./CommonComponents";
import { PRIMARY_THEME_COLOR } from "../configs/constants";
import SearchPlanConfig from "../services/SearchPlanConfig";

const page = "microplanDetails";

const MicroplanDetails = ({
  MicroplanName = "default",
  campaignType = Digit.SessionStorage.get("microplanHelperData")?.campaignData?.projectType,
  microplanData,
  setMicroplanData,
  checkDataCompletion,
  setCheckDataCompletion,
  currentPage,
  pages,
  ...props
}) => {
  const { t } = useTranslation();
  const [microplan, setMicroplan] = useState(Digit.SessionStorage.get("microplanData")?.microplanDetails?.name);
  const { state, dispatch } = useMyContext();
  const [modal, setModal] = useState("none");
  const [toast, setToast] = useState();

  //fetch campaign data
  const { id = "" } = Digit.Hooks.useQueryParams();
  const { isLoading: isCampaignLoading, data: campaignData } = Digit.Hooks.microplan.useSearchCampaign(
    {
      CampaignDetails: {
        tenantId: Digit.ULBService.getCurrentTenantId(),
        ids: [id],
      },
    },
    {
      enabled: !!id,
      select: (data) => {
        const campaignCard = [
          {
            label: t("CAMPAIGN_NAME"),
            value: data?.campaignName ? data?.campaignName : t("ES_COMMON_NA"),
          },
          {
            label: t(`CAMPAIGN_TYPE`),
            value: data?.projectType ? t(`CAMPAIGN_TYPE_${data?.projectType}`) : t("ES_COMMON_NA"),
          },
          {
            label: t(`CAMPAIGN_BENEFICIARY_TYPE`),
            value: data?.additionalDetails?.beneficiaryType
              ? t(`CAMPAIGN_BENEFICIARY_TYPE${data?.additionalDetails?.beneficiaryType}`)
              : t("ES_COMMON_NA"),
          },
          {
            label: t("CAMPAIGN_DATE"),
            value: data.startDate
              ? data.endDate
                ? `${Digit.DateUtils.ConvertEpochToDate(data.startDate)} - ${Digit.DateUtils.ConvertEpochToDate(data.endDate)}`
                : Digit.DateUtils.ConvertEpochToDate(data.startDate)
              : t("ES_COMMON_NA"),
          },
        ];
        return campaignCard;
      },
    }
  );

  // Set TourSteps
  useEffect(() => {
    const tourData = tourSteps(t)?.[page] || {};
    if (state?.tourStateData?.name === page) return;
    dispatch({
      type: "SETINITDATA",
      state: { tourStateData: tourData },
    });
  }, []);

  // Save data to ssn of data change
  useEffect(() => {
    setMicroplanData((previous) => ({
      ...previous,
      microplanDetails: {
        name: microplan,
      },
    }));
  }, [microplan]);

  useEffect(() => {
    if (checkDataCompletion !== "true" || !setCheckDataCompletion) return;
    // uncomment to activate data change save check
    // if (
    //   !microplanData?.microplanDetails ||
    //   !_.isEqual(
    //     {
    //       name: microplan,
    //     },
    //     microplanData.microplanDetails
    //   )
    // )
    //   setModal("data-change-check");
    else updateData(true);
  }, [checkDataCompletion]);

  // UseEffect to add a event listener for keyboard
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [modal]);

  const handleKeyPress = (event) => {
    // if (modal !== "upload-guidelines") return;
    if (["x", "Escape"].includes(event.key)) {
      // Perform the desired action when "x" or "esc" is pressed
      // if (modal === "upload-guidelines")
      setCheckDataCompletion("false");
      setModal("none");
    }
  };
  const validateMicroplanName = async () => {
    const body = {
      PlanConfigurationSearchCriteria: {
        name: microplan,
        tenantId: Digit.ULBService.getCurrentTenantId(),
      },
    };
    const response = await SearchPlanConfig(body);
    if (response?.PlanConfiguration?.length === 0) {
      return true;
    } else if (response?.PlanConfiguration?.length === 1) {
      if (response?.PlanConfiguration[0].id === microplanData?.planConfigurationId) {
        return true;
      }
    }
    return false;
  };
  // check if data has changed or not
  const updateData = useCallback(
    async (check) => {
      if (checkDataCompletion !== "true" || !setCheckDataCompletion) return;
      if (!validateName(microplan)) {
        setCheckDataCompletion("false");
        return setToast({ state: "error", message: t("ERROR_MICROPLAN_NAME_CRITERIA") });
      }
      const valid = await validateMicroplanName();
      if (!valid) {
        setToast({ state: "error", message: t("ERROR_DUPLICATE_MICROPLAN_NAME") });
        setCheckDataCompletion("false");
        return;
      }
      if (check) {
        setMicroplanData((previous) => ({
          ...previous,
          microplanDetails: {
            name: microplan,
          },
        }));
        if (!["", null, undefined].includes(microplan)) {
          setCheckDataCompletion("valid");
        } else {
          setCheckDataCompletion("invalid");
        }
      } else {
        if (!["", null, undefined].includes(microplanData?.microplanDetails?.name)) {
          setCheckDataCompletion("valid");
        } else {
          setCheckDataCompletion("invalid");
        }
      }
    },
    [checkDataCompletion, microplan, microplanData, setCheckDataCompletion, setMicroplanData, validateMicroplanName]
  );

  // const cancelUpdateData = useCallback(() => {
  //   setCheckDataCompletion(false);
  //   setModal('none');
  // }, [setCheckDataCompletion, setModal]);
  function validateName(name) {
    const namePattern = /^(?![\d\s+\-()]+$)[A-Za-z\d\s+\-()]*$/;
    return namePattern.test(name);
  }
  const onChangeMicroplanName = (e) => {
    setMicroplan(e.target.value);
  };

  if (isCampaignLoading) {
    return <Loader />;
  }

  return (
    <>
      <Card
        style={{
          margin: "1rem 0 1rem 0",
          padding: "1.5rem 1.5rem 1.5rem 1.5rem",
        }}
        className="microplan-campaign-detials"
      >
        <CardSectionHeader
          style={{
            margin: "0",
            paddingLeft: "0",
          }}
        >
          {t("CAMPAIGN_DETAILS")}
        </CardSectionHeader>

        <StatusTable style={{ paddingLeft: "0" }}>
          {campaignData?.length > 0 &&
            campaignData?.map((row, idx) => {
              return (
                <Row
                  key={idx}
                  label={row?.label}
                  text={row?.value}
                  rowContainerStyle={{ margin: "0", padding: "0", height: "2.4rem", justifyContent: "flex-start" }}
                  className="border-none"
                  last={idx === campaignData?.length - 1}
                />
              );
            })}
        </StatusTable>
      </Card>
      <Card
        style={{
          margin: "1rem 0 1rem 0",
          padding: "1.5rem 1.5rem 1.5rem 1.5rem",
        }}
        className="microplan-name"
      >
        <CardSubHeader style={{ marginBottom: "1.5rem" }}>{t("NAME_YOUR_MP")}</CardSubHeader>
        <p style={{ marginBottom: "1.5rem" }}>{t("MP_FOOTER")}</p>
        <LabelFieldPair>
          <CardLabel style={{ fontWeight: "500", display: "flex", alignItems: "center", margin: 0 }}>
            {`${t("NAME_OF_MP")}  `} <p style={{ color: "red", margin: 0 }}> *</p>
          </CardLabel>
          <div style={{ width: "100%", maxWidth: "960px", height: "fit-content" }}>
            <TextInput
              t={t}
              style={{ width: "100%", margin: 0 }}
              type={"text"}
              isMandatory={false}
              name="name"
              value={microplan}
              onChange={onChangeMicroplanName}
              // {...(validation = {
              //   isRequired: true,
              //   pattern: "^[a-zA-Z-.`' ]*$",
              //   type: "tel",
              //   title: t("CORE_COMMON_PROFILE_NAME_ERROR_MESSAGE"),
              // })}
              disable={false}
            />
          </div>
        </LabelFieldPair>
      </Card>
      {toast && toast.state === "error" && (
        <Toast style={{ zIndex: "9999999" }} label={toast.message} isDleteBtn onClose={() => setToast(null)} type="error" />
      )}
      {/* // uncomment to activate data change save check
      {modal === "data-change-check" && (
        <Modal
          popupStyles={{ borderRadius: "0.25rem", width: "31.188rem" }}
          popupModuleActionBarStyles={{
            display: "flex",
            flex: 1,
            justifyContent: "space-between",
            padding: 0,
            width: "100%",
            padding: "0 0 1rem 1.3rem",
          }}
          popupModuleMianStyles={{ padding: 0, margin: 0 }}
          style={{
            flex: 1,
            backgroundColor: "white",
            border: `0.063rem solid ${PRIMARY_THEME_COLOR}`,
          }}
          headerBarMainStyle={{ padding: 0, margin: 0 }}
          headerBarMain={<ModalHeading style={{ fontSize: "1.5rem" }} label={t("HEADING_DATA_WAS_UPDATED_WANT_TO_SAVE")} />}
          headerBarEnd={<CloseButton clickHandler={cancelUpdateData} style={{ padding: "0.4rem 0.8rem 0 0" }} />}
          actionCancelLabel={t("YES")}
          actionCancelOnSubmit={updateData.bind(null, true)}
          actionSaveLabel={t("NO")}
          actionSaveOnSubmit={() => updateData(false)}
        >
          <div className="modal-body">
            <p className="modal-main-body-p">{t("INSTRUCTION_DATA_WAS_UPDATED_WANT_TO_SAVE")}</p>
          </div>
        </Modal>
      )} */}
    </>
  );
};

export default MicroplanDetails;
