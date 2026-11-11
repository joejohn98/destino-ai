import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { api, type Destination } from "@/lib/api";
import { CATEGORIES } from "../_components/destination-filters";

interface FilterParams {
  q: string;
  category: string;
  location: string;
  minRating: number;
  page: number;
}

export function useDestinationFilters({
  initialDestinations = [],
  initialTotalDestinations = 0,
  initialTotalPages = 0,
}: {
  initialDestinations?: Destination[];
  initialTotalDestinations?: number;
  initialTotalPages?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const locationParam = searchParams.get("location") ?? "";
  const searchParam = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const ratingParam = Number(searchParams.get("minRating") ?? "0");
  const ratingFromUrl =
    Number.isFinite(ratingParam) && ratingParam >= 0 && ratingParam <= 5
      ? ratingParam
      : 0;
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10) || 1;

  const [query, setQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORIES.some((c) => c.value === categoryParam) ? categoryParam : "all",
  );
  const [activeLocation, setActiveLocation] = useState(locationParam);
  const [minRating, setMinRating] = useState(ratingFromUrl);
  const [currentPage, setCurrentPage] = useState(pageParam);

  const [destinations, setDestinations] =
    useState<Destination[]>(initialDestinations);
  const [totalDestinations, setTotalDestinations] = useState(
    initialTotalDestinations,
  );
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [, startTransition] = useTransition();
  const isFirstMount = useRef(initialDestinations.length > 0);

  const syncUrl = useCallback(
    (params: FilterParams) => {
      const qs = new URLSearchParams();
      if (params.q.trim().length >= 2) qs.set("q", params.q.trim());
      if (params.category && params.category !== "all")
        qs.set("category", params.category);
      if (params.location) qs.set("location", params.location);
      if (params.minRating > 0)
        qs.set("minRating", String(params.minRating));
      if (params.page > 1) qs.set("page", String(params.page));

      const newUrl = qs.toString() ? `${pathname}?${qs.toString()}` : pathname;
      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [pathname, router],
  );

  const updateFilter = (partial: Partial<FilterParams>) => {
    const next: FilterParams = {
      q: partial.q ?? query,
      category: partial.category ?? selectedCategory,
      location: partial.location ?? activeLocation,
      minRating: partial.minRating ?? minRating,
      page: partial.page ?? 1,
    };
    if (partial.q !== undefined) setQuery(partial.q);
    if (partial.category !== undefined) setSelectedCategory(partial.category);
    if (partial.location !== undefined) setActiveLocation(partial.location);
    if (partial.minRating !== undefined) setMinRating(partial.minRating);
    setCurrentPage(next.page);
    syncUrl(next);
  };

  const handleSearch = (newQuery: string) =>
    updateFilter({ q: newQuery });
  const handleCategoryChange = (category: string) =>
    updateFilter({ category });
  const handleRatingChange = (rating: number) =>
    updateFilter({ minRating: rating });
  const handleClearLocation = () =>
    updateFilter({ location: "" });
  const handlePageChange = (newPage: number) => {
    updateFilter({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      setLoadError("");
      try {
        const search = query.trim();
        const res = await api.getDestinations({
          page: currentPage,
          limit: 24,
          ...(search.length >= 2 ? { search } : {}),
          ...(activeLocation ? { location: activeLocation } : {}),
          ...(selectedCategory !== "all" ? { category: selectedCategory } : {}),
          ...(minRating > 0 ? { minRating } : {}),
        });

        if (!isCancelled) {
          startTransition(() => {
            setDestinations(res.data || []);
            setTotalDestinations(res.totalDestinations);
            setTotalPages(res.totalPages);
          });
        }
      } catch {
        if (!isCancelled) {
          setLoadError(
            "We couldn’t reach the destination database. Please check your connection and try again.",
          );
          setDestinations([]);
          setTotalDestinations(0);
          setTotalPages(0);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    const timer = setTimeout(
      () => {
        void loadData();
      },
      query ? 300 : 0,
    );

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, selectedCategory, activeLocation, minRating, currentPage]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    selectedCategory !== "all" ||
    activeLocation !== "" ||
    minRating > 0;

  const handleReset = () => {
    setQuery("");
    setSelectedCategory("all");
    setActiveLocation("");
    setMinRating(0);
    setCurrentPage(1);
    syncUrl({ q: "", category: "all", location: "", minRating: 0, page: 1 });
  };

  return {
    query,
    selectedCategory,
    activeLocation,
    minRating,
    currentPage,
    destinations,
    totalDestinations,
    totalPages,
    isLoading,
    loadError,
    hasActiveFilters,
    handleSearch,
    handleCategoryChange,
    handleRatingChange,
    handleClearLocation,
    handlePageChange,
    handleReset,
  };
}
