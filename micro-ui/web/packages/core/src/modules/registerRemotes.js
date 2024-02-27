//here export a func that basically registers the app using single spa react pkg
//routing and all we have to handle in remote app itself
//need to share history obj i think(we need to rethink the routing part)

import { registerApplication,start } from "single-spa";

export default (queryClient) => {

  registerApplication({
    name: "Workbench",
    app: () => import("workbench/WorkbenchModule"),
    activeWhen: "/digit-ui/employee/workbench",
    customProps: {
      title: "Workbench is running on host",
      queryClient,
    },
  });

  // registerApplication({
  //   name: "app1",
  //   app: () => import("app1/App"),
  //   activeWhen: "/",
  //   customProps: {
  //     title: "App 1 running on host",
  //     queryClient,
  //   },
  // });

  registerApplication({
    name: "HRMS",
    app: () => import("hrms/HRMSModule"),
    activeWhen: "/digit-ui/employee/hrms",
    customProps: {
      title: "HRMS is running on host",
      queryClient,
    },
  }); 

  
  registerApplication({
    name: "Engagement",
    app: () => import("engagement/EngagementModule"),
    activeWhen: "/digit-ui/employee/engagement",
    customProps: {
      title: "Engagement is running on host",
      queryClient,
    },
  }); 

  start();
}

