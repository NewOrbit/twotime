/**
 * Targetprocess project model for consumption within this utility.
 * Ian French, NewOrbit Ltd, Jan 2025.
 */

interface TpProjectProcess {
  ResourceType: string;
  Id: number
}

export interface TpProject {
  Id: number;
  Name: string;
  ResourceType: string;
  Process: TpProjectProcess;
}
