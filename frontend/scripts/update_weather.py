#!/usr/bin/env python3
import os
import sys
import json
import requests

# Clave de API de AEMET (obtenida de la configuración local)
AEMET_API_KEY = os.getenv(
    "AEMET_API_KEY", 
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjamNhc3RlbEBnbWFpbC5jb20iLCJqdGkiOiI5YmUyODE2OS01ZTA0LTRiNTQtYmE0NC00MTI0NmJiMTYwMTgiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTc4MTI1MzkxNywidXNlcklkIjoiOWJlMjgxNjktNWUwNC00YjU0LWJhNDQtNDEyNDZiYjE2MDE4Iiwicm9sZSI6IiJ9.R0VXb1xOEAeda6chntM6C_HTrOhqBJBJrHp4bbcaaIk"
)

# Rutas de salida del archivo JSON
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "../public/aemet_data.json")

def call_aemet(endpoint: str) -> dict:
    url = f"https://opendata.aemet.es/opendata/api{endpoint}"
    response = requests.get(url, params={"api_key": AEMET_API_KEY}, timeout=10)
    response.raise_for_status()
    data = response.json()
    if isinstance(data, dict) and "datos" in data:
        datos_url = data["datos"]
        datos_response = requests.get(datos_url, timeout=10)
        datos_response.raise_for_status()
        return datos_response.json()
    return data

def clean_precipitation(prob_list):
    cleaned = []
    # Buscar el periodo completo 00-24 y ponerlo primero
    for item in prob_list:
        if item.get("periodo") == "00-24":
            cleaned.append({"value": int(item.get("value") or 0), "periodo": "00-24"})
            break
    # Añadir los periodos fraccionados
    for item in prob_list:
        if item.get("periodo") != "00-24":
            cleaned.append({"value": int(item.get("value") or 0), "periodo": item.get("periodo")})
    if not cleaned:
        cleaned = [{"value": 0, "periodo": "00-24"}]
    return cleaned

def clean_sky(sky_list):
    cleaned = []
    main_sky = None
    # Buscar el primer periodo que tenga descripción textual del cielo
    for item in sky_list:
        if item.get("descripcion"):
            main_sky = {"descripcion": item.get("descripcion"), "value": item.get("value")}
            break
    if not main_sky and sky_list:
        main_sky = {"descripcion": sky_list[0].get("descripcion") or "Despejado", "value": sky_list[0].get("value") or "11"}
    if not main_sky:
        main_sky = {"descripcion": "Despejado", "value": "11"}
    
    cleaned.append(main_sky)
    for item in sky_list:
        cleaned.append({"descripcion": item.get("descripcion") or "", "value": item.get("value") or ""})
    return cleaned

def clean_wind(wind_list):
    cleaned = []
    main_wind = None
    # Buscar primer periodo con viento activo
    for item in wind_list:
        if item.get("velocidad") and item.get("direccion") and item.get("direccion") != "C":
            main_wind = {"direccion": item.get("direccion"), "velocidad": int(item.get("velocidad"))}
            break
    if not main_wind and wind_list:
        main_wind = {"direccion": wind_list[0].get("direccion") or "C", "velocidad": int(wind_list[0].get("velocidad") or 0)}
    if not main_wind:
        main_wind = {"direccion": "O", "velocidad": 10}
        
    cleaned.append(main_wind)
    for item in wind_list:
        cleaned.append({"direccion": item.get("direccion") or "C", "velocidad": int(item.get("velocidad") or 0)})
    return cleaned

def process_city(aemet_resp, name, province):
    if not aemet_resp or not isinstance(aemet_resp, list):
        return None
    
    pred_data = aemet_resp[0]
    days = pred_data.get("prediccion", {}).get("dia", [])
    
    processed_days = []
    # Obtener hasta 4 días de predicción meteorológica
    for day in days[:4]:
        processed_day = {
            "fecha": day.get("fecha"),
            "temperatura": {
                "maxima": int(day.get("temperatura", {}).get("maxima") or 35),
                "minima": int(day.get("temperatura", {}).get("minima") or 20)
            },
            "probPrecipitacion": clean_precipitation(day.get("probPrecipitacion", [])),
            "estadoCielo": clean_sky(day.get("estadoCielo", [])),
            "viento": clean_wind(day.get("viento", [])),
            "humedadRelativa": {
                "maxima": int(day.get("humedadRelativa", {}).get("maxima") or 50),
                "minima": int(day.get("humedadRelativa", {}).get("minima") or 15)
            }
        }
        processed_days.append(processed_day)
        
    return {
        "nombre": name,
        "provincia": province,
        "prediccion": {
            "dia": processed_days
        }
    }

def main():
    print("Iniciando actualización de datos meteorológicos reales de AEMET...")
    try:
        # 1. Toledo - Alcaudete de la Jara (Cercano a Alcañizo - Municipio ID: 45005)
        toledo_raw = call_aemet("/prediccion/especifica/municipio/diaria/45005")
        toledo_proc = process_city(toledo_raw, "Alcaudete de la Jara", "Toledo")
        
        # 2. Cáceres - Trujillo (Municipio ID: 10190)
        caceres_raw = call_aemet("/prediccion/especifica/municipio/diaria/10190")
        caceres_proc = process_city(caceres_raw, "Trujillo", "Cáceres")
        
        if toledo_proc and caceres_proc:
            result = {
                "toledo": toledo_proc,
                "caceres": caceres_proc
            }
            # Guardar el JSON resultante
            with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"¡Éxito! Datos actualizados en: {OUTPUT_PATH}")
        else:
            print("Error: No se pudieron procesar las predicciones para una o ambas ciudades.")
            sys.exit(1)
    except Exception as e:
        print(f"Error crítico al conectar con la API de AEMET: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
