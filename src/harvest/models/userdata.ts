/**
 * Harvest user data model for consumption within this utility.
 * Ian French, NewOrbit Ltd, Jan 2025.
 */

export interface HarvestUserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  timezone: string;
  is_contractor: boolean;
  is_active: boolean;
  has_access_to_all_future_projects: boolean;
}
