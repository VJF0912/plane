import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
// hooks
import { useLabel } from "hooks/store";
import { useMobxStore } from "lib/mobx/store-provider";
// components
import { AppliedFiltersList } from "components/issues";
// types
import { IIssueFilterOptions } from "types";
import { EIssueFilterType } from "constants/issue";

export const GlobalViewsAppliedFiltersRoot = observer(() => {
  // router
  const router = useRouter();
  const { workspaceSlug } = router.query as { workspaceSlug: string; globalViewId: string };
  // store hooks
  const {
    workspaceGlobalIssuesFilter: { issueFilters, updateFilters },
  } = useMobxStore();
  const {
    workspace: { workspaceLabels },
  } = useLabel();
  // derived values
  const userFilters = issueFilters?.filters;

  // filters whose value not null or empty array
  const appliedFilters: IIssueFilterOptions = {};
  Object.entries(userFilters ?? {}).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value) && value.length === 0) return;
    appliedFilters[key as keyof IIssueFilterOptions] = value;
  });

  const handleRemoveFilter = (key: keyof IIssueFilterOptions, value: string | null) => {
    if (!value) {
      updateFilters(workspaceSlug, EIssueFilterType.FILTERS, { [key]: null });
      return;
    }

    let newValues = userFilters?.[key] ?? [];
    newValues = newValues.filter((val) => val !== value);
    updateFilters(workspaceSlug, EIssueFilterType.FILTERS, { [key]: newValues });
  };

  const handleClearAllFilters = () => {
    if (!workspaceSlug) return;
    const newFilters: IIssueFilterOptions = {};
    Object.keys(userFilters ?? {}).forEach((key) => {
      newFilters[key as keyof IIssueFilterOptions] = null;
    });
    updateFilters(workspaceSlug, EIssueFilterType.FILTERS, { ...newFilters });
  };

  // const handleUpdateView = () => {
  //   if (!workspaceSlug || !globalViewId || !viewDetails) return;

  //   globalViewsStore.updateGlobalView(workspaceSlug.toString(), globalViewId.toString(), {
  //     query_data: {
  //       ...viewDetails.query_data,
  //       filters: {
  //         ...(storedFilters ?? {}),
  //       },
  //     },
  //   });
  // };

  // update stored filters when view details are fetched
  // useEffect(() => {
  //   if (!globalViewId || !viewDetails) return;

  //   if (!globalViewFiltersStore.storedFilters[globalViewId.toString()])
  //     globalViewFiltersStore.updateStoredFilters(globalViewId.toString(), viewDetails?.query_data?.filters ?? {});
  // }, [globalViewId, globalViewFiltersStore, viewDetails]);

  // return if no filters are applied
  if (Object.keys(appliedFilters).length === 0) return null;

  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <AppliedFiltersList
        labels={workspaceLabels ?? undefined}
        appliedFilters={appliedFilters ?? {}}
        handleClearAllFilters={handleClearAllFilters}
        handleRemoveFilter={handleRemoveFilter}
      />

      {/* {storedFilters && viewDetails && areFiltersDifferent(storedFilters, viewDetails.query_data.filters ?? {}) && (
        <Button variant="primary" onClick={handleUpdateView}>
          Update view
        </Button>
      )} */}
    </div>
  );
});
