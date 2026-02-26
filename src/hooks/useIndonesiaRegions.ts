import { useState, useCallback } from "react";

const BASE_URL = "https://ibnux.github.io/data-indonesia";

export interface Region {
  id: string;
  nama: string;
}

export function useIndonesiaRegions() {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  const fetchProvinces = useCallback(async () => {
    if (provinces.length > 0) return; // cached
    setLoadingProvinces(true);
    try {
      const res = await fetch(`${BASE_URL}/provinsi.json`);
      const data = await res.json();
      setProvinces(data);
    } catch (e) {
      console.error("Gagal memuat provinsi", e);
    } finally {
      setLoadingProvinces(false);
    }
  }, [provinces.length]);

  const fetchCities = useCallback(async (provinceId: string) => {
    if (!provinceId) return;
    setCities([]);
    setDistricts([]);
    setVillages([]);
    setLoadingCities(true);
    try {
      const res = await fetch(`${BASE_URL}/kabupaten/${provinceId}.json`);
      const data = await res.json();
      setCities(data);
    } catch (e) {
      console.error("Gagal memuat kab/kota", e);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const fetchDistricts = useCallback(async (cityId: string) => {
    if (!cityId) return;
    setDistricts([]);
    setVillages([]);
    setLoadingDistricts(true);
    try {
      const res = await fetch(`${BASE_URL}/kecamatan/${cityId}.json`);
      const data = await res.json();
      setDistricts(data);
    } catch (e) {
      console.error("Gagal memuat kecamatan", e);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  const fetchVillages = useCallback(async (districtId: string) => {
    if (!districtId) return;
    setVillages([]);
    setLoadingVillages(true);
    try {
      const res = await fetch(`${BASE_URL}/kelurahan/${districtId}.json`);
      const data = await res.json();
      setVillages(data);
    } catch (e) {
      console.error("Gagal memuat kelurahan", e);
    } finally {
      setLoadingVillages(false);
    }
  }, []);

  return {
    provinces,
    cities,
    districts,
    villages,
    loadingProvinces,
    loadingCities,
    loadingDistricts,
    loadingVillages,
    fetchProvinces,
    fetchCities,
    fetchDistricts,
    fetchVillages,
  };
}
