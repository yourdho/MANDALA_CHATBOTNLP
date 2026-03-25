import sys
import json
import os
import re

def load_env(env_path):
    config = {}
    try:
        with open(env_path, 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, val = line.strip().split('=', 1)
                    config[key] = val.strip('"\'')
    except Exception:
        pass
    return config

def get_db_connection(config, base_dir):
    db_connection = config.get('DB_CONNECTION', 'sqlite')
    if db_connection == 'sqlite':
        import sqlite3
        db_path = config.get('DB_DATABASE', os.path.join(base_dir, 'database', 'database.sqlite'))
        if not os.path.isabs(db_path):
            db_path = os.path.join(base_dir, db_path)
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn, 'sqlite'
    elif db_connection == 'mysql':
        import mysql.connector
        conn = mysql.connector.connect(
            host=config.get('DB_HOST', '127.0.0.1'),
            port=config.get('DB_PORT', '3306'),
            user=config.get('DB_USERNAME', 'root'),
            password=config.get('DB_PASSWORD', ''),
            database=config.get('DB_DATABASE', 'forge')
        )
        return conn, 'mysql'
    return None, None

def load_slang_dict(conn, db_type):
    slang_dict = {}
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT slang, formal FROM chatbot_dictionaries")
        rows = cursor.fetchall()
        if db_type == 'sqlite':
            for row in rows:
                slang_dict[row['slang'].lower()] = row['formal'].lower()
        else:
            for row in rows:
                slang_dict[row[0].lower()] = row[1].lower()
    except Exception:
        pass
    return slang_dict

def normalize_text(text, slang_dict):
    words = text.lower().split()
    normalized = []
    for word in words:
        clean_word = re.sub(r'[^\w]', '', word)
        normalized.append(slang_dict.get(clean_word, clean_word))
    return ' '.join(normalized)

def classify_intent(text, original):
    """
    Mengklasifikasikan niat (intent) pengguna berdasarkan teks yang sudah dinormalisasi.
    """
    text_l = text.lower()
    text_words = text_l.split()

    # Mapping keywords ke intent
    intent_map = {
        'greeting': ['halo', 'hai', 'hello', 'hi', 'assalamualaikum', 'pagi', 'siang', 'malam', 'selamat'],
        'booking_lapangan': ['lapangan', 'futsal', 'minisoccer', 'mini soccer', 'soccer', 'bola', 'padel', 'badminton', 'bulutangkis', 'pilates'],
        'booking_intent': ['booking', 'pesan', 'reservasi', 'book', 'mau', 'pengen', 'ingin', 'minta'],
        'ask_schedule': ['jadwal', 'tersedia', 'slot', 'kosong', 'ada', 'cek', 'lihat'],
        'confirm': ['ya', 'iya', 'oke', 'ok', 'deal', 'benar', 'betul', 'setuju', 'yup', 'yap'],
        'cancel': ['batal', 'cancel', 'tidak', 'nggak', 'ga', 'gak', 'jangan'],
        'thanks': ['makasih', 'terimakasih', 'terima kasih', 'thanks', 'thank', 'thx'],
        'help': ['help', 'bantuan', 'tolong', 'bisa apa', 'fitur', 'fungsi', 'cara', 'panduan', 'tutorial', 'gimana', 'bagaimana'],
        'list_lapangan': ['apa aja', 'daftar lapangan', 'ada lapangan', 'list', 'pilihan', 'tersedia lapangan', 'venue apa', 'mau liat'],
        'ask_location': ['alamat', 'lokasi', 'di mana', 'dimana', 'maps', 'rute', 'tempat', 'jalan', 'daerah'],
        'ask_rating': ['rating', 'ulasan', 'review', 'bagus', 'rekomendasi', 'bintang'],
        'ask_price': ['harga', 'tarif', 'biaya', 'bayar', 'berapa', 'price', 'rp'],
        'ask_contact': ['kontak', 'hubungi', 'telp', 'nomor', 'wa', 'whatsapp', 'call'],
    }

    # Cek intent satu per satu
    for intent, keywords in intent_map.items():
        for kw in keywords:
            # Jika keyword ada dlm teks (atau dlm kata-kata jika keyword tunggal)
            if ' ' in kw:
                if kw in text_l: return intent
            else:
                if kw in text_words: return intent

    return 'unknown'

def extract_entities(text):
    """
    Ekstraksi entitas dari teks: tanggal, waktu, dan jenis layanan.
    """
    entities = {}

    # 1. Deteksi WAKTU (Jam)
    # Pattern: 14:00, 10.00, jam 2, jam 14, 10 pagi, 2 siang
    time_patterns = [
        r'(?:jam|pukul)\s*(\d{1,2})(?:[.:](\d{2}))?', # jam 10, jam 10.30
        r'(\d{1,2})[.:](\d{2})',                      # 10:30, 14.00
        r'(\d{1,2})\s*(?:pagi|siang|sore|malam)'       # 10 pagi, 2 siang
    ]

    for pattern in time_patterns:
        match = re.search(pattern, text)
        if match:
            h = int(match.group(1))
            m = match.group(2) if len(match.groups()) > 1 and match.group(2) else "00"
            
            # Konversi jam 2 siang -> 14
            if 'siang' in text or 'sore' in text or 'malam' in text:
                if h < 12: h += 12
            
            entities['waktu'] = f"{h:02d}:{m}"
            break

    # 2. Deteksi TANGGAL
    if 'besok' in text:
        entities['tanggal'] = 'besok'
    elif 'lusa' in text:
        entities['tanggal'] = 'lusa'
    elif any(x in text for x in ['hari ini', 'sekarang']):
        entities['tanggal'] = 'hari ini'
        if 'sekarang' in text and 'waktu' not in entities:
            entities['waktu'] = 'sekarang'
    else:
        # Pattern tanggal: 10 maret, 25 desember 2024, 2024-12-25
        bulan_list = r'(?:januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)'
        date_match = re.search(r'(\d{1,2})\s+(' + bulan_list + r')(?:\s+(\d{4}))?', text)
        if date_match:
            entities['tanggal'] = date_match.group(0)
        else:
            iso_match = re.search(r'\d{4}-\d{2}-\d{2}', text)
            if iso_match:
                entities['tanggal'] = iso_match.group(0)

    # 3. Deteksi LAYANAN
    if any(w in text for w in ['lapangan', 'futsal', 'soccer', 'mini soccer']):
        entities['layanan'] = 'mini soccer'
    elif any(w in text for w in ['padel', 'raket']):
        entities['layanan'] = 'padel'
    elif any(w in text for w in ['badminton', 'bulutangkis']):
        entities['layanan'] = 'badminton'
    elif any(w in text for w in ['pilates', 'yoga', 'studio']):
        entities['layanan'] = 'pilates'

    return entities

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No input provided'}))
        return

    input_text = sys.argv[1]

    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(script_dir)
    env_path = os.path.join(base_dir, '.env')

    config = load_env(env_path)
    conn, db_type = get_db_connection(config, base_dir)

    slang_dict = {}
    if conn:
        slang_dict = load_slang_dict(conn, db_type)
        conn.close()

    normalized_text = normalize_text(input_text, slang_dict)
    intent = classify_intent(normalized_text, input_text)
    entities = extract_entities(normalized_text)

    print(json.dumps({
        'original': input_text,
        'normalized': normalized_text,
        'intent': intent,
        'entities': entities
    }))

if __name__ == "__main__":
    main()
