import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import { getMenuByDate } from "../../services/menu";
import type { Campus, MenuDay } from "../../types/menu";
import {
  CAMPUS_STORAGE_KEY,
  MENU_LOAD_ERROR_MESSAGE,
  isCampus,
} from "./constants";
import { clampDateKeyToMenuHistory, createTodayKey } from "./date";

export function useMenuScreen() {
  const [campus, setCampus] = useState<Campus | null>(null);
  const [dateKey, setDateKeyState] = useState(createTodayKey);
  const [menuDay, setMenuDay] = useState<MenuDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCampusHydrated, setIsCampusHydrated] = useState(false);

  function setDateKey(nextDateKey: string) {
    setDateKeyState((currentDateKey) => {
      const clampedDateKey = clampDateKeyToMenuHistory(nextDateKey);
      return currentDateKey === clampedDateKey ? currentDateKey : clampedDateKey;
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function restoreCampus() {
      try {
        const savedCampus = await AsyncStorage.getItem(CAMPUS_STORAGE_KEY);
        if (!cancelled) {
          setCampus(savedCampus && isCampus(savedCampus) ? savedCampus : "Eunpyeong");
        }
      } catch (storageError) {
        if (__DEV__) {
          console.error("Failed to restore campus:", storageError);
        }
        if (!cancelled) {
          setCampus("Eunpyeong");
        }
      } finally {
        if (!cancelled) {
          setIsCampusHydrated(true);
        }
      }
    }

    void restoreCampus();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isCampusHydrated || !campus) {
      return;
    }

    const selectedCampus = campus;

    async function persistCampus() {
      try {
        await AsyncStorage.setItem(CAMPUS_STORAGE_KEY, selectedCampus);
      } catch (storageError) {
        if (__DEV__) {
          console.error("Failed to persist campus:", storageError);
        }
      }
    }

    void persistCampus();
  }, [campus, isCampusHydrated]);

  useEffect(() => {
    if (!isCampusHydrated || !campus) {
      return;
    }

    const selectedCampus = campus;
    let cancelled = false;

    async function loadMenu() {
      const clampedDateKey = clampDateKeyToMenuHistory(dateKey);

      if (clampedDateKey !== dateKey) {
        setDateKeyState(clampedDateKey);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const menu = await getMenuByDate(selectedCampus, clampedDateKey);
        if (!cancelled) {
          setMenuDay(menu);
        }
      } catch (loadError) {
        if (!cancelled) {
          if (__DEV__) {
            console.error("Failed to load menu:", loadError);
          }

          setMenuDay(null);
          setError(MENU_LOAD_ERROR_MESSAGE);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMenu();

    return () => {
      cancelled = true;
    };
  }, [campus, dateKey, isCampusHydrated]);

  return {
    campus,
    setCampus,
    dateKey,
    setDateKey,
    menuDay,
    loading,
    error,
  };
}
