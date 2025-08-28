/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

"use client"
import { FormEvent, useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { getforecastapi, getweatherapi } from "../../services/weatherapiservices";
import Image from "next/image";


interface ForecastDay {
  date: string;
  temperature: number;
  condition: string;
  icon: string;
}


interface CityWeather {
  city: string;
  temperature: number;
  condition: string;
  favourite: boolean;
  icon: string;
  forecast?: ForecastDay[];
}



export default function Home() {
  const [cities, setCities] = useState<CityWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const currentMode = localStorage.getItem("isDarkMode");
    if (currentMode !== null) {
      setIsDarkMode(currentMode === "true");
    }
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("isDarkMode", isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteCities");
    if (storedFavorites) {
      const favCities: CityWeather[] = JSON.parse(storedFavorites);
      setCities((previous) => {
        const merged = [...previous];
        favCities.forEach((f) => {
          if (!merged.some((c) => c.city === f.city)) {
            merged.push(f);
          } else {
            merged.forEach((c) => {
              if (c.city === f.city) {
                f.favourite = true;
              }
            })
          }
        })
        return merged;
      })
    }
  }, []);
 
  const chanagefavourite = (cityName: string) => {
    setCities((previous) => {
      const updatedCities = previous.map((city) => city.city === cityName ? { ...city, favourite: !city.favourite } : city);
      const favToSave = updatedCities.filter((c) => c.favourite);
      localStorage.setItem("favoriteCities", JSON.stringify(favToSave));
      return updatedCities;
    });
  };
  

  const displayedCities = showFavoritesOnly
  ? cities.filter((city) => city.favourite)
  : cities;

  const fetchapi = async (city: string) => {
    try {
      setLoading(true);

      const currentData = await getweatherapi(city);
      const forecastData = await getforecastapi(city);
  
      if (!forecastData || !forecastData.list) throw new Error("Invalid forecast data");
  
      const forcastdays: ForecastDay[] = [];
      const includeddate = new Set();
      const today = new Date().toLocaleDateString();
  
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt_txt).toLocaleDateString();
        if (date !== today && !includeddate.has(date) && forcastdays.length < 5) {
          forcastdays.push({
            date: item.dt_txt,
            temperature: Math.round(item.main.temp),
            condition: item.weather[0].main,
            icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          });
          includeddate.add(date);
        }
      });
  
      const newcity: CityWeather = {
        city: currentData.name,
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        favourite: false,
        icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`,
        forecast: forcastdays,
      };
  
      setCities((previous) => {
        if (previous.some((c) => c.city === newcity.city)) return previous;
        return [...previous, newcity];
      });
      setSearchTerm("");
    } catch (error) {
      console.log(error);
      alert("City not found");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = ((e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) fetchapi(searchTerm.trim());
  })

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className={`text-4xl font-extrabold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Weather Dashboard
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-5 items-center justify-between mb-10">
          <form onSubmit={handleSearch} className={`flex items-center w-full md:w-[55%] p-3 rounded-xl shadow-md transition ${isDarkMode ? "border border-white" : "border border-grey"}`}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for a city..."
              className={`flex-1 px-4 py-2 rounded-lg bg-transparent outline-none text-sm ${isDarkMode
                  ? "text-gray-100 placeholder-gray-400"
                  : "text-gray-900 placeholder-gray-500"
                }`}
              disabled={loading}
            />
            <button
              type="submit"
              className="ml-3 px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
              disabled={loading}
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </form>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-5 py-2 rounded-lg shadow-md transition text-sm font-medium ${showFavoritesOnly
                  ? "bg-yellow-500 text-white"
                  : isDarkMode
                    ? "border border-white text-white hover:bg-gray-600"
                    : "border border-grey text-gray-700 hover:bg-gray-300"
                }`}
            >
              Favorites
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-4 py-2 rounded-lg shadow-md transition text-sm font-medium ${isDarkMode
                  ? "border border-white hover:bg-gray-600 text-white-400"
                  : "border border-grey hover:bg-gray-300 text-gray-800"
                }`}
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>

        {displayedCities.length === 0 ? (
          <p className={`text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            No cities added yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {displayedCities.map((city, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl p-5 shadow-lg transition border flex flex-col items-center text-center hover:scale-[1.02] ${isDarkMode
                    ? "border border-white"
                    : "border border-grey"
                  }`}
              >
                <button
                  onClick={() => chanagefavourite(city.city)} className="absolute top-3 right-3 text-2xl transition-colors hover:text-yellow-400">
                  <FaStar
                    className={`transition-colors ${
                      city.favourite
                        ? "text-yellow-400"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-300"
                    } hover:text-yellow-400`}
                    size={24}
                  />
                </button>

                <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  {city.city} (Today)
                </h2>

                <div className="flex items-center justify-center gap-3 mt-3">
                    <Image src={city.icon} alt={city.condition} width={30} height={30}/>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white-900" : "text-black-900"}`}>
                    {city.temperature}°C
                  </p>
                </div>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} text-sm mt-1`}>
                  {city.condition}
                </p>

                {city.forecast && (
                  <div className="grid grid-cols-5 gap-2 mt-4 w-full">
                    {city.forecast.map((day, idx2) => (
                      <div
                        key={idx2} className={`flex flex-col items-center justify-center p-2 rounded-lg transition ${isDarkMode ? "bg-gray-500" : "bg-gray-50"}`}>
                        <p className={`text-xs font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700" }`}>
                          {idx2 === 0
                            ? "Tomorrow"
                            : new Date(day.date).toLocaleDateString(undefined, {
                              weekday: "short",
                            })}
                        </p>
                        <Image src={day.icon} alt={day.condition} width={30} height={30}/>
                        <p className={`text-sm font-semibold ${isDarkMode ? "text-white-900" : "text-black-900"}`}>
                          {day.temperature}°C
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
