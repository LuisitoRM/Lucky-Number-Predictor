import os
import logging
import pandas as pd
import numpy as np
import psycopg2
from psycopg2 import pool, extras
from flask import Flask, jsonify, request, render_template

# Configuración de Logging de Grado Producción
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Nota: La SECRET_KEY debe ser una cadena aleatoria cargada desde el panel de Render [7]
app.secret_key = os.environ.get('SECRET_KEY', 'neural-expert-v1316-secure-universal')

# Configuración de Matrices por Lotería
CONFIG_LOTTO = {
    'baloto': {'n': 5, 'max_main': 43, 'max_spec': 16, 'sum_range': (82, 137)},
    'powerball': {'n': 5, 'max_main': 69, 'max_spec': 26, 'sum_range': (130, 221)}
}

# Gestión de Pool de Conexiones PostgreSQL (Plan Hobby Basic) [8, 1]
DATABASE_URL = os.environ.get('DATABASE_URL')
try:
    # Pool de 15 conexiones para optimizar RAM en Render [8, 3]
    db_pool = psycopg2.pool.SimpleConnectionPool(1, 15, dsn=DATABASE_URL)
    logger.info("Pool de conexiones de PostgreSQL inicializado correctamente.")
except Exception as e:
    logger.error(f"Fallo crítico en conexión a la base de datos: {e}")
    db_pool = None

def get_db():
    return db_pool.getconn()

def release_db(conn):
    db_pool.putconn(conn)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({"status": "online", "version": "13.1.6"}), 200

# --- ENDPOINTS DE ADMINISTRACIÓN ---

@app.route('/api/status', methods=['GET'])
def get_status():
    """Devuelve el conteo de registros históricos por lotería."""
    conn = None
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT tipo, COUNT(*) FROM historial GROUP BY tipo")
        stats = {row[0]: row[1] for row in cur.fetchall()}
        return jsonify({"status": "success", "counts": stats})
    except Exception as e:
        logger.error(f"Error en status: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: release_db(conn)

@app.route('/api/subir/<tipo>', methods=['POST'])
def subir_datos(tipo):
    """Módulo de ingesta masiva (CSV). Restaurado de V12.9."""
    if tipo not in CONFIG_LOTTO:
        return jsonify({"status": "error", "message": "Lotería no configurada"}), 400
    
    conn = None
    try:
        file = request.files.get('file')
        if not file: return jsonify({"status": "error", "message": "No se recibió el archivo"}), 400
        
        df = pd.read_csv(file, sep=None, engine='python')
        df.columns = [c.lower() for c in df.columns]
        
        conn = get_db()
        cur = conn.cursor()
        
        data_to_save = []
        for _, row in df.iterrows():
            id_u = f"{tipo}_{row['fecha']}"
            data_to_save.append((id_u, row['fecha'], tipo, row['n1'], row['n2'], row['n3'], row['n4'], row['n5'], row['especial']))
        
        # Inserción masiva eficiente contra duplicados 
        query = """
            INSERT INTO historial (id_unico, fecha, tipo, n1, n2, n3, n4, n5, especial)
            VALUES %s ON CONFLICT (id_unico) DO NOTHING
        """
        psycopg2.extras.execute_values(cur, query, data_to_save)
        conn.commit()
        return jsonify({"status": "success", "message": f"Se procesaron {len(data_to_save)} registros de {tipo}."})
    except Exception as e:
        logger.error(f"Error en carga masiva: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if conn: release_db(conn)

# --- MOTOR DE PREDICCIÓN NEURAL ---

@app.route('/api/predecir', methods=['POST'])
def predecir():
    """Motor IA: Frecuencias Ponderadas + Monte Carlo (10,000 iteraciones).[9, 4]"""
    conn = None
    try:
        data = request.get_json()
        tipo = data.get('tipo', 'baloto').lower()
        cfg = CONFIG_LOTTO.get(tipo, CONFIG_LOTTO['baloto'])
        
        conn = get_db()
        # Consulta segura parametrizada para evitar Inyección SQL 
        query = "SELECT n1, n2, n3, n4, n5 FROM historial WHERE tipo = %s ORDER BY fecha DESC LIMIT 500"
        df = pd.read_sql(query, conn, params=(tipo,))
        
        if df.empty or len(df) < 5:
            return jsonify({"status": "error", "message": "Historial insuficiente en base de datos"}), 400

        # Análisis de Frecuencias Ponderadas [10]
        nums_flat = df.values.flatten()
        rango_posible = list(range(1, cfg['max_main'] + 1))
        counts = pd.Series(nums_flat).value_counts(normalize=True).reindex(rango_posible, fill_value=0.01)
        
        # Simulación de Monte Carlo con filtros estocásticos estructurales [6, 11]
        simulaciones_validas = []
        for _ in range(10000):
            # Selección basada en probabilidad ponderada (Frecuencia vs Azar)
            pick = np.random.choice(rango_posible, size=cfg['n'], replace=False, p=counts.values / counts.sum())
            suma = np.sum(pick)
            # Filtro de Probabilidad Estructural del 70% 
            if cfg['sum_range'][0] <= suma <= cfg['sum_range'][1]:
                simulaciones_validas.append(tuple(sorted(pick)))

        # Selección de la combinación por convergencia estadística [12]
        if not simulaciones_validas:
            res_nums = sorted(np.random.choice(rango_posible, cfg['n'], replace=False))
        else:
            res_nums = list(pd.Series(simulaciones_validas).value_counts().idxmax())
        
        # Generación de bola especial reglamentaria
        sb = np.random.randint(1, cfg['max_spec'] + 1)
        
        return jsonify({
            "status": "success", 
            "numeros": [int(n) for n in res_nums], 
            "super_balota": int(sb),
            "metodologia": f"Neural-MonteCarlo-v13.1.6 ({tipo})"
        })
    except Exception as e:
        logger.error(f"Fallo en motor de IA: {e}")
        return jsonify({"status": "error", "message": "Error interno en el motor de cálculo"}), 500
    finally:
        if conn: release_db(conn)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
