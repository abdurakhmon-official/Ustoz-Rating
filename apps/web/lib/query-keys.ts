export const queryKeys = {
  me: ['me'] as const,
  adminUsersBase: ['admin-users'] as const,
  adminUsers: (query: Record<string, unknown> = {}) => [...queryKeys.adminUsersBase, query] as const,
  regions: ['regions'] as const,
  districts: (regionId: string) => ['districts', regionId] as const,
  schools: (districtId: string) => ['schools', districtId] as const,
  subjects: ['subjects'] as const,
  adminSubjects: ['admin-subjects'] as const,
  adminTestsBase: ['admin-tests'] as const,
  adminTests: (query: Record<string, unknown> = {}) => [...queryKeys.adminTestsBase, query] as const,
  adminTest: (testId: string) => ['admin-test', testId] as const,
};
