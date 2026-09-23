export type Locale = "es" | "en" | "pt" | "fr" | "de" | "it" | "ru" | "zh";

export interface Dictionary {
  appName: string;
  newChat: string;
  openMenu: string;
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  greetingSubtitle: string;
  placeholder: string;
  attach: string;
  attachHint: string;
  dropReference: string;
  removeImage: string;
  generate: string;
  generating: string;
  stopGeneration: string;
  historyEmpty: string;
  you: string;
  download: string;
  deleteChat: string;
  settings: string;
  settingsTitle: string;
  language: string;
  clearHistory: string;
  clearHistoryConfirm: string;
  confirmYes: string;
  confirmCancel: string;
  close: string;
  clarificationTitle: string;
  customAnswerPlaceholder: string;
  categoryHintLabel: string;
  categoryAuto: string;
  aspectRatioLabel: string;
  editImage: string;
  editedCount: string;
  editPlaceholder: string;
  editOriginal: string;
  editSend: string;
  editFormatOnly: string;
  categories: Record<string, string>;
  aspectRatios: Record<string, string>;
}

export const DICTIONARIES: Record<Locale, Dictionary> = {
  es: {
    appName: "IA Images",
    newChat: "Nuevo chat",
    openMenu: "Abrir menú",
    greetingMorning: "Buenos días",
    greetingAfternoon: "Buenas tardes",
    greetingEvening: "Buenas noches",
    greetingSubtitle: "¿Qué imagen creamos hoy?",
    placeholder:
      'Ej: "Quiero un poster para un evento en el edificio AC el 15 de septiembre, charla de desarrollo personal"',
    attach: "Adjuntar imagen de referencia",
    attachHint: "También puedes pegarla (Ctrl+V) o arrastrarla al chat",
    dropReference: "Suelta la imagen para usarla como referencia",
    removeImage: "Quitar imagen",
    generate: "Generar imagen",
    generating: "Generando…",
    stopGeneration: "Detener generación",
    historyEmpty: "Tus chats van a aparecer aquí.",
    you: "Tú",
    download: "Descargar",
    deleteChat: "Eliminar",
    settings: "Configuración",
    settingsTitle: "Configuración",
    language: "Idioma",
    clearHistory: "Borrar todo el historial",
    clearHistoryConfirm: "¿Estás seguro? Esto no se puede deshacer.",
    confirmYes: "Sí, borrar",
    confirmCancel: "Cancelar",
    close: "Cerrar",
    clarificationTitle: "Antes de generar, ayúdame con un par de detalles:",
    customAnswerPlaceholder: "O escribe tu propia respuesta…",
    categoryHintLabel: "Categoría",
    categoryAuto: "Detectar automáticamente",
    aspectRatioLabel: "Proporción",
    editImage: "Editar imagen",
    editedCount: "Editada ({n})",
    editPlaceholder: "¿Qué quieres cambiar en esta imagen?",
    editOriginal: "Versión original",
    editSend: "Enviar cambio",
    editFormatOnly: "Cambiar el formato a {format}",
    categories: {
      poster_evento: "Poster de evento",
      post_redes: "Post para redes",
      producto: "Producto",
      retrato_avatar: "Retrato / avatar",
      general: "Otro",
    },
    aspectRatios: {
      "1:1": "1:1 · Cuadrado",
      "16:9": "16:9 · Horizontal",
      "9:16": "9:16 · Vertical",
      "4:3": "4:3 · Clásico",
      "3:4": "3:4 · Retrato",
    },
  },
  en: {
    appName: "IA Images",
    newChat: "New chat",
    openMenu: "Open menu",
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    greetingSubtitle: "What image should we create today?",
    placeholder:
      'E.g. "I want a poster for an event at the AC building on September 15th, a talk on personal development"',
    attach: "Attach reference image",
    attachHint: "You can also paste it (Ctrl+V) or drag it into the chat",
    dropReference: "Drop the image to use it as a reference",
    removeImage: "Remove image",
    generate: "Generate image",
    generating: "Generating…",
    stopGeneration: "Stop generating",
    historyEmpty: "Your chats will show up here.",
    you: "You",
    download: "Download",
    deleteChat: "Delete",
    settings: "Settings",
    settingsTitle: "Settings",
    language: "Language",
    clearHistory: "Clear all history",
    clearHistoryConfirm: "Are you sure? This can't be undone.",
    confirmYes: "Yes, delete",
    confirmCancel: "Cancel",
    close: "Close",
    clarificationTitle: "Before generating, help me with a couple of details:",
    customAnswerPlaceholder: "Or type your own answer…",
    categoryHintLabel: "Category",
    categoryAuto: "Auto-detect",
    aspectRatioLabel: "Aspect ratio",
    editImage: "Edit image",
    editedCount: "Edited ({n})",
    editPlaceholder: "What do you want to change in this image?",
    editOriginal: "Original version",
    editSend: "Send edit",
    editFormatOnly: "Change the format to {format}",
    categories: {
      poster_evento: "Event poster",
      post_redes: "Social media post",
      producto: "Product",
      retrato_avatar: "Portrait / avatar",
      general: "Other",
    },
    aspectRatios: {
      "1:1": "1:1 · Square",
      "16:9": "16:9 · Landscape",
      "9:16": "9:16 · Vertical",
      "4:3": "4:3 · Classic",
      "3:4": "3:4 · Portrait",
    },
  },
  pt: {
    appName: "IA Images",
    newChat: "Novo chat",
    openMenu: "Abrir menu",
    greetingMorning: "Bom dia",
    greetingAfternoon: "Boa tarde",
    greetingEvening: "Boa noite",
    greetingSubtitle: "Qual imagem vamos criar hoje?",
    placeholder:
      'Ex: "Quero um pôster para um evento no prédio AC no dia 15 de setembro, palestra sobre desenvolvimento pessoal"',
    attach: "Anexar imagem de referência",
    attachHint: "Você também pode colá-la (Ctrl+V) ou arrastá-la para o chat",
    dropReference: "Solte a imagem para usá-la como referência",
    removeImage: "Remover imagem",
    generate: "Gerar imagem",
    generating: "Gerando…",
    stopGeneration: "Parar geração",
    historyEmpty: "Seus chats vão aparecer aqui.",
    you: "Você",
    download: "Baixar",
    deleteChat: "Excluir",
    settings: "Configurações",
    settingsTitle: "Configurações",
    language: "Idioma",
    clearHistory: "Apagar todo o histórico",
    clearHistoryConfirm: "Tem certeza? Isso não pode ser desfeito.",
    confirmYes: "Sim, apagar",
    confirmCancel: "Cancelar",
    close: "Fechar",
    clarificationTitle: "Antes de gerar, me ajude com alguns detalhes:",
    customAnswerPlaceholder: "Ou escreva sua própria resposta…",
    categoryHintLabel: "Categoria",
    categoryAuto: "Detectar automaticamente",
    aspectRatioLabel: "Proporção",
    editImage: "Editar imagem",
    editedCount: "Editada ({n})",
    editPlaceholder: "O que você quer mudar nesta imagem?",
    editOriginal: "Versão original",
    editSend: "Enviar edição",
    editFormatOnly: "Mudar o formato para {format}",
    categories: {
      poster_evento: "Pôster de evento",
      post_redes: "Post para redes sociais",
      producto: "Produto",
      retrato_avatar: "Retrato / avatar",
      general: "Outro",
    },
    aspectRatios: {
      "1:1": "1:1 · Quadrado",
      "16:9": "16:9 · Horizontal",
      "9:16": "9:16 · Vertical",
      "4:3": "4:3 · Clássico",
      "3:4": "3:4 · Retrato",
    },
  },
  fr: {
    appName: "IA Images",
    newChat: "Nouvelle discussion",
    openMenu: "Ouvrir le menu",
    greetingMorning: "Bonjour",
    greetingAfternoon: "Bon après-midi",
    greetingEvening: "Bonsoir",
    greetingSubtitle: "Quelle image créons-nous aujourd'hui ?",
    placeholder:
      'Ex : "Je veux une affiche pour un événement au bâtiment AC le 15 septembre, une conférence sur le développement personnel"',
    attach: "Joindre une image de référence",
    attachHint: "Tu peux aussi la coller (Ctrl+V) ou la glisser dans le chat",
    dropReference: "Dépose l'image pour l'utiliser comme référence",
    removeImage: "Retirer l'image",
    generate: "Générer l'image",
    generating: "Génération…",
    stopGeneration: "Arrêter la génération",
    historyEmpty: "Vos discussions apparaîtront ici.",
    you: "Vous",
    download: "Télécharger",
    deleteChat: "Supprimer",
    settings: "Paramètres",
    settingsTitle: "Paramètres",
    language: "Langue",
    clearHistory: "Effacer tout l'historique",
    clearHistoryConfirm: "Es-tu sûr ? Cette action est irréversible.",
    confirmYes: "Oui, supprimer",
    confirmCancel: "Annuler",
    close: "Fermer",
    clarificationTitle: "Avant de générer, aide-moi avec quelques détails :",
    customAnswerPlaceholder: "Ou écris ta propre réponse…",
    categoryHintLabel: "Catégorie",
    categoryAuto: "Détection automatique",
    aspectRatioLabel: "Format",
    editImage: "Modifier l'image",
    editedCount: "Modifiée ({n})",
    editPlaceholder: "Que veux-tu changer dans cette image ?",
    editOriginal: "Version originale",
    editSend: "Envoyer la modification",
    editFormatOnly: "Changer le format en {format}",
    categories: {
      poster_evento: "Affiche d'événement",
      post_redes: "Publication réseaux sociaux",
      producto: "Produit",
      retrato_avatar: "Portrait / avatar",
      general: "Autre",
    },
    aspectRatios: {
      "1:1": "1:1 · Carré",
      "16:9": "16:9 · Paysage",
      "9:16": "9:16 · Vertical",
      "4:3": "4:3 · Classique",
      "3:4": "3:4 · Portrait",
    },
  },
  de: {
    appName: "IA Images",
    newChat: "Neuer Chat",
    openMenu: "Menü öffnen",
    greetingMorning: "Guten Morgen",
    greetingAfternoon: "Guten Tag",
    greetingEvening: "Guten Abend",
    greetingSubtitle: "Welches Bild erstellen wir heute?",
    placeholder:
      'Z. B.: "Ich möchte ein Plakat für eine Veranstaltung im AC-Gebäude am 15. September, ein Vortrag über persönliche Entwicklung"',
    attach: "Referenzbild anhängen",
    attachHint: "Du kannst es auch einfügen (Strg+V) oder in den Chat ziehen",
    dropReference: "Bild ablegen, um es als Referenz zu verwenden",
    removeImage: "Bild entfernen",
    generate: "Bild erstellen",
    generating: "Wird erstellt…",
    stopGeneration: "Erstellung stoppen",
    historyEmpty: "Deine Chats werden hier angezeigt.",
    you: "Du",
    download: "Herunterladen",
    deleteChat: "Löschen",
    settings: "Einstellungen",
    settingsTitle: "Einstellungen",
    language: "Sprache",
    clearHistory: "Gesamten Verlauf löschen",
    clearHistoryConfirm: "Bist du sicher? Dies kann nicht rückgängig gemacht werden.",
    confirmYes: "Ja, löschen",
    confirmCancel: "Abbrechen",
    close: "Schließen",
    clarificationTitle: "Bevor ich das Bild erstelle, hilf mir mit ein paar Details:",
    customAnswerPlaceholder: "Oder schreib deine eigene Antwort…",
    categoryHintLabel: "Kategorie",
    categoryAuto: "Automatisch erkennen",
    aspectRatioLabel: "Seitenverhältnis",
    editImage: "Bild bearbeiten",
    editedCount: "Bearbeitet ({n})",
    editPlaceholder: "Was möchtest du an diesem Bild ändern?",
    editOriginal: "Originalversion",
    editSend: "Änderung senden",
    editFormatOnly: "Format zu {format} ändern",
    categories: {
      poster_evento: "Veranstaltungsplakat",
      post_redes: "Social-Media-Beitrag",
      producto: "Produkt",
      retrato_avatar: "Porträt / Avatar",
      general: "Sonstiges",
    },
    aspectRatios: {
      "1:1": "1:1 · Quadratisch",
      "16:9": "16:9 · Querformat",
      "9:16": "9:16 · Hochformat",
      "4:3": "4:3 · Klassisch",
      "3:4": "3:4 · Porträt",
    },
  },
  it: {
    appName: "IA Images",
    newChat: "Nuova chat",
    openMenu: "Apri menu",
    greetingMorning: "Buongiorno",
    greetingAfternoon: "Buon pomeriggio",
    greetingEvening: "Buonasera",
    greetingSubtitle: "Quale immagine creiamo oggi?",
    placeholder:
      'Es: "Voglio un poster per un evento nell\'edificio AC il 15 settembre, una conferenza sullo sviluppo personale"',
    attach: "Allega immagine di riferimento",
    attachHint: "Puoi anche incollarla (Ctrl+V) o trascinarla nella chat",
    dropReference: "Rilascia l'immagine per usarla come riferimento",
    removeImage: "Rimuovi immagine",
    generate: "Genera immagine",
    generating: "Generazione…",
    stopGeneration: "Ferma generazione",
    historyEmpty: "Le tue chat appariranno qui.",
    you: "Tu",
    download: "Scarica",
    deleteChat: "Elimina",
    settings: "Impostazioni",
    settingsTitle: "Impostazioni",
    language: "Lingua",
    clearHistory: "Cancella tutta la cronologia",
    clearHistoryConfirm: "Sei sicuro? Questa azione non può essere annullata.",
    confirmYes: "Sì, elimina",
    confirmCancel: "Annulla",
    close: "Chiudi",
    clarificationTitle: "Prima di generare, aiutami con un paio di dettagli:",
    customAnswerPlaceholder: "Oppure scrivi la tua risposta…",
    categoryHintLabel: "Categoria",
    categoryAuto: "Rilevamento automatico",
    aspectRatioLabel: "Proporzioni",
    editImage: "Modifica immagine",
    editedCount: "Modificata ({n})",
    editPlaceholder: "Cosa vuoi cambiare in questa immagine?",
    editOriginal: "Versione originale",
    editSend: "Invia modifica",
    editFormatOnly: "Cambia il formato in {format}",
    categories: {
      poster_evento: "Poster evento",
      post_redes: "Post social",
      producto: "Prodotto",
      retrato_avatar: "Ritratto / avatar",
      general: "Altro",
    },
    aspectRatios: {
      "1:1": "1:1 · Quadrato",
      "16:9": "16:9 · Orizzontale",
      "9:16": "9:16 · Verticale",
      "4:3": "4:3 · Classico",
      "3:4": "3:4 · Ritratto",
    },
  },
  ru: {
    appName: "IA Images",
    newChat: "Новый чат",
    openMenu: "Открыть меню",
    greetingMorning: "Доброе утро",
    greetingAfternoon: "Добрый день",
    greetingEvening: "Добрый вечер",
    greetingSubtitle: "Какое изображение создадим сегодня?",
    placeholder:
      'Напр.: "Хочу постер для мероприятия в здании AC 15 сентября, лекция по личностному развитию"',
    attach: "Прикрепить референс-изображение",
    attachHint: "Можно также вставить (Ctrl+V) или перетащить изображение в чат",
    dropReference: "Отпустите изображение, чтобы использовать его как референс",
    removeImage: "Удалить изображение",
    generate: "Создать изображение",
    generating: "Создаём…",
    stopGeneration: "Остановить генерацию",
    historyEmpty: "Ваши чаты появятся здесь.",
    you: "Вы",
    download: "Скачать",
    deleteChat: "Удалить",
    settings: "Настройки",
    settingsTitle: "Настройки",
    language: "Язык",
    clearHistory: "Очистить всю историю",
    clearHistoryConfirm: "Вы уверены? Это действие нельзя отменить.",
    confirmYes: "Да, удалить",
    confirmCancel: "Отмена",
    close: "Закрыть",
    clarificationTitle: "Прежде чем создать изображение, помогите мне с парой деталей:",
    customAnswerPlaceholder: "Или напишите свой ответ…",
    categoryHintLabel: "Категория",
    categoryAuto: "Определить автоматически",
    aspectRatioLabel: "Пропорции",
    editImage: "Редактировать изображение",
    editedCount: "Отредактировано ({n})",
    editPlaceholder: "Что вы хотите изменить на этом изображении?",
    editOriginal: "Исходная версия",
    editSend: "Отправить изменение",
    editFormatOnly: "Изменить формат на {format}",
    categories: {
      poster_evento: "Постер мероприятия",
      post_redes: "Пост для соцсетей",
      producto: "Продукт",
      retrato_avatar: "Портрет / аватар",
      general: "Другое",
    },
    aspectRatios: {
      "1:1": "1:1 · Квадрат",
      "16:9": "16:9 · Горизонтальный",
      "9:16": "9:16 · Вертикальный",
      "4:3": "4:3 · Классический",
      "3:4": "3:4 · Портрет",
    },
  },
  zh: {
    appName: "IA Images",
    newChat: "新建聊天",
    openMenu: "打开菜单",
    greetingMorning: "早上好",
    greetingAfternoon: "下午好",
    greetingEvening: "晚上好",
    greetingSubtitle: "今天要创建什么图片？",
    placeholder: '例如："我想要一张9月15日AC大楼活动的海报，主题是个人发展讲座"',
    attach: "附加参考图片",
    attachHint: "也可以粘贴（Ctrl+V）或拖入聊天",
    dropReference: "松开即可将图片用作参考",
    removeImage: "移除图片",
    generate: "生成图片",
    generating: "生成中…",
    stopGeneration: "停止生成",
    historyEmpty: "您的聊天记录将显示在这里。",
    you: "您",
    download: "下载",
    deleteChat: "删除",
    settings: "设置",
    settingsTitle: "设置",
    language: "语言",
    clearHistory: "清除所有历史记录",
    clearHistoryConfirm: "您确定吗？此操作无法撤销。",
    confirmYes: "是，删除",
    confirmCancel: "取消",
    close: "关闭",
    clarificationTitle: "在生成之前，请帮我补充一些细节：",
    customAnswerPlaceholder: "或输入您自己的回答…",
    categoryHintLabel: "类别",
    categoryAuto: "自动检测",
    aspectRatioLabel: "比例",
    editImage: "编辑图片",
    editedCount: "已编辑（{n}）",
    editPlaceholder: "您想更改这张图片的什么内容？",
    editOriginal: "原始版本",
    editSend: "发送修改",
    editFormatOnly: "将格式改为{format}",
    categories: {
      poster_evento: "活动海报",
      post_redes: "社交媒体帖子",
      producto: "产品",
      retrato_avatar: "肖像 / 头像",
      general: "其他",
    },
    aspectRatios: {
      "1:1": "1:1 · 正方形",
      "16:9": "16:9 · 横版",
      "9:16": "9:16 · 竖版",
      "4:3": "4:3 · 经典",
      "3:4": "3:4 · 肖像",
    },
  },
};

export const SUPPORTED_LOCALES = Object.keys(DICTIONARIES) as Locale[];

export function detectBrowserLocale(): Locale {
  const candidates =
    typeof navigator !== "undefined" && navigator.languages?.length
      ? navigator.languages
      : [typeof navigator !== "undefined" ? navigator.language : ""];

  for (const candidate of candidates) {
    const code = candidate.slice(0, 2).toLowerCase();
    if ((SUPPORTED_LOCALES as string[]).includes(code)) return code as Locale;
  }

  return "en";
}

export function getGreeting(dict: Dictionary): string {
  const hour = new Date().getHours();
  if (hour < 12) return dict.greetingMorning;
  if (hour < 19) return dict.greetingAfternoon;
  return dict.greetingEvening;
}
