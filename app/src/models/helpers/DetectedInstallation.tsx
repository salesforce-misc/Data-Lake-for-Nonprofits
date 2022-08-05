import { types, Instance } from "mobx-state-tree";

/**
 * Represents a short information about a detected installation
 */
export const DetectedInstallation = types
  .model("DetectedInstallation", {
    id: "",
    webUrlOrigin: "",
    reachable: true,
    region: "",
    installationJson: types.maybe(types.frozen()),
  })

  .views((self) => ({
    get startDate(): Date | undefined {
      return self.installationJson?.startDate;
    },

    get startedBy(): string | undefined {
      return self.installationJson?.startedBy;
    },

    get accountId(): string | undefined {
      return self.installationJson?.accountId;
    },

    get appFlowConnectionName(): string | undefined {
      return self.installationJson?.appFlowConnectionName;
    },
  }));

export interface IDetectedInstallation extends Instance<typeof DetectedInstallation> {}
