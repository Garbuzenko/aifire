#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os
import time
import requests
from deep_translator import GoogleTranslator

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def translate_json(obj, dest_lang, src_lang='en'):
    if isinstance(obj, dict):
        return {k: translate_json(v, dest_lang, src_lang) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [translate_json(item, dest_lang, src_lang) for item in obj]
    elif isinstance(obj, str) and obj.strip():
        try:
            # Special manual translations for better quality
            if src_lang == 'en' and dest_lang == 'ru':
                if obj == "WILL AI TAKE MY JOB?":
                    return "ЗАБЕРЕТ ЛИ ИИ МОЮ РАБОТУ?"
                if obj == "Check the future":
                    return "Проверить будущее"
                if obj == "Analyzing...":
                    return "Анализирую..."
                if obj == "Risk of automation":
                    return "Риск автоматизации"
                if obj == "Safe Skills":
                    return "Безопасные навыки"
                if obj == "Tasks at risk":
                    return "Задачи под угрозой"
                if obj == "Verdict":
                    return "Вердикт"
                if obj == "Rationale":
                    return "Обоснование"
                if obj == "Will AI take my job?- Free career analysis":
                    return "Заберет ли ИИ мою работу? - Бесплатный анализ карьеры"
                if obj == "Check if artificial intelligence is a threat to your profession.Get a free risk analysis and safe skills list.":
                    return "Проверьте, угрожает ли искусственный интеллект вашей профессии. Получите бесплатный анализ рисков и список безопасных навыков."
                if obj == "Supported by":
                    return "При поддержке"
                if obj == "Join the community":
                    return "Вступайте в сообщество"
                if obj == "Statistics":
                    return "Статистика"

            translator = GoogleTranslator(source=src_lang, target=dest_lang)
            result = translator.translate(obj)
            time.sleep(0.5)  # Increased delay to avoid rate limits
            return result
        except Exception as e:
            print(f"Error translating '{obj}': {e}")
            return obj
    return obj

# Load en.json as source
with open(os.path.join(SCRIPT_DIR, 'en.json'), 'r', encoding='utf-8') as f:
    source_data = json.load(f)

# Recreate ru.json
target_languages = ['ru']

# Get all supported languages from Google Translator
supported_languages = GoogleTranslator().get_supported_languages(as_dict=True)
languages = [code for code in supported_languages.values() if code != 'en']
target_languages.extend([l for l in languages if l not in target_languages])

for lang_code in target_languages:
    print(f"Translating to {lang_code}...")
    translated = translate_json(source_data, lang_code, src_lang='en')
    with open(os.path.join(SCRIPT_DIR, f'{lang_code}.json'), 'w', encoding='utf-8') as f:
        json.dump(translated, f, ensure_ascii=False, indent=2)
    print(f"[OK] {lang_code}.json")
