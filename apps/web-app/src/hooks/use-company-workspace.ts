import { useQuery } from "@tanstack/react-query";
import CompanyService from "@/services/company.service";
import type { CompanyWorkspaceResponse } from "@/types/company";

const emptyWorkspace: CompanyWorkspaceResponse = {
  company: null,
  invites: [],
  leaderboard: [],
};

export function useCompanyWorkspace() {
  return useQuery({
    queryKey: ["company-workspace"],
    queryFn: async () => {
      try {
        return await CompanyService.fetchWorkspace();
      } catch {
        return emptyWorkspace;
      }
    },
    staleTime: 1000 * 60,
  });
}
