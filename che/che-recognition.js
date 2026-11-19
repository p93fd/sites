/* ЧЕ — локальное распознавание операций. Не отправляет изображения или текст в сеть. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CheRecognition = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CATEGORY_GROUPS = [
    ['Каждый день', ['Продукты', 'Еда', 'Кафе', 'Транспорт', 'Такси', 'Покупки', 'Одежда и обувь']],
    ['Обязательные платежи', ['Квартплата и ЖКХ', 'Электричество и вода', 'Интернет', 'Мобильная связь', 'Аренда и ипотека', 'Страхование', 'Налоги и штрафы', 'Банковские комиссии']],
    // «Дом» остаётся в старых записях и справочнике иконок для совместимости,
    // но в новых 29 категориях пользователь выбирает конкретное «Дом и ремонт».
    ['Дом и семья', ['Дом и ремонт', 'Дети и школа', 'Репетиторы', 'Животные']],
    ['Для себя', ['Здоровье', 'Красота', 'Тренировки', 'Подписки', 'Развлечения', 'Путешествия', 'Подарки', 'Авто']],
    ['Остальное', ['Благотворительность', 'Другое']]
  ];
  const RULES = [
    ['Квартплата и ЖКХ', /жкх|жилищн|квартплат|коммунальн|управляющ.{0,12}компан|тсж|е[иi][рp][цc]|гис жкх|капремонт|капитальн.{0,8}ремонт|взнос.{0,8}дом/],
    ['Электричество и вода', /электроэнерг|электросбыт|петроэлектросбыт|мосэнерг|водоканал|водоснабж|водоотведен|теплоснабж|теплоэнерг|газоснабж|межрегионгаз|оплата за свет|оплата за воду|газовая служба/],
    ['Интернет', /ростелеком|дом\.ру|dom\.ru|\bинтернет\b|провайдер|wifi|wi-fi|домашн.{0,8}(интернет|сет)|оплата сети|ттк(?:\s|$)/],
    ['Мобильная связь', /мобильн.{0,8}связ|мтс|\bmts\b|билайн|\bbeeline\b|мегафон|\btele2\b|\bt2\b|\byota\b|йота|сбермобайл|теле2/],
    ['Аренда и ипотека', /ипотек|аренд[аыу] (?:квартир|жил|дом)|найм жил|жилищн.{0,5}кредит|платеж по ипотеке/],
    ['Страхование', /страхован|страховк|осаго|каско|\bingos\b|ингосстрах|ресо гаранти|согаз|альфастрах/],
    ['Налоги и штрафы', /фнс|налог|госпошлин|штраф|гибдд|постановлени.{0,8}штраф/],
    ['Банковские комиссии', /комисси.{0,15}(банк|перевод|обслуж)|обслуживан.{0,10}карт|плата за уведомлен|sms-информ|смс-информ/],
    ['Репетиторы', /репетитор|уроки английск|занятия по (?:матем|русск|англ)|english tutor|tutoring|индивидуальн.{0,8}занят/],
    ['Дети и школа', /детск.{0,5}сад|школьн|продленк|продлёнк|кружок|секци.{0,8}дет|школьн.{0,8}питан|канцелярия для школ/],
    ['Тренировки', /трениров|фитнес|тренер|спортзал|fitness|\bgym\b|fitlab|бассейн|йога|пилатес/],
    ['Здоровье', /аптек|медиц|клиник|здоров|врач|витамин|таблет|ригла|горздрав|36,6|эаптека|стоматолог|анализ|инвитро|гемотест|оптик|поликлиник/],
    ['Животные', /зоомагазин|зоотовар|ветеринар|ветклиник|четыре лапы|petshop|корм для (?:собак|кошек)/],
    ['Красота', /салон красот|парикмах|маникюр|педикюр|косметолог|барбершоп|бровист|массаж|летуаль|л.?этуаль|золотое яблоко|рив гош/],
    ['Такси', /яндекс.{0,5}(?:го|такси)|\buber\b|ситимобил|такси|\bgett\b/],
    ['Авто', /азс|бензин|дизель|запчаст|лукойл|газпромнефт|роснефт|шин(?:омонтаж)?|автомойк|автосервис|техосмотр|автозаправк/],
    ['Путешествия', /авиабилет|аэрофлот|победа ави|\bs7\b|туроператор|отел[ьи]|hotel|гостиниц|booking|путешеств|\bржд\b|ж\/д билет/],
    ['Транспорт', /метро|автобус|проезд|тройка|каршеринг|делимобиль|ситидрайв|белкакар|парковк|whoosh|юрент|электросамокат|городск.{0,8}транспорт/],
    ['Подписки', /подписк|subscription|netflix|яндекс плюс|apple\.com\/bill|spotify|icloud|кинопоиск|\bokko\b|\bivi\b|\byoutube\b|chatgpt|openai|anthropic|claude|telegram premium|vk музыка|литрес/],
    ['Еда', /яндекс[ .-]?еда|yandex[ .-]?(?:eda|food)|delivery club|деливери клаб|доставка еды|готовая еда|еда на дом/],
    ['Кафе', /кофейн|кофе с собой|бургер|ресторан|кафе|пицц|суши|роллы|макдоналд|вкусно и точка|шоколадниц|starbucks|cofix|кофикс|теремок|\bkfc\b|rostic|ростикс|додо|пекарн|столовая|шаурм|coffee|cafe/],
    ['Одежда и обувь', /\blamoda\b|ламода|\bzara\b|uniqlo|\bh&m\b|gloria jeans|глория джинс|одежд|обув|спортмастер|\breebok\b|\bnike\b/],
    ['Дом и ремонт', /мебел|леруа|leroy|оби(?:\s|$)|икеа|ikea|\bhoff\b|хофф|стройматериал|ремонт квартир|строительн.{0,7}магазин|сантехник|бытов.{0,8}техник/],
    ['Развлечения', /кинотеатр|театр|концерт|боулинг|квест|аквапарк|музей|выставк|аттракцион/],
    ['Подарки', /подарок|подарочн|цветы|букет|флорист/],
    ['Благотворительность', /благотвор|пожертвован|фонд помощи/],
    ['Продукты', /пятероч|магнит|перекресток|лента|вкусвилл|ашан|дикси|азбука вкуса|metro c&c|окей|глобус|\bspar\b|спар|бристоль|красное и белое|верный|светофор|fix price|фикс прайс|самокат|яндекс лавка|супермаркет|продукт|молоко|хлеб|сыр|мясо|фрукт|овощ/],
    ['Покупки', /wildberries|\bozon\b|озон|вайлдберриз|м\.видео|мвидео|днс|\bdns\b|эльдорадо|детский мир|aliexpress|алиэкспресс|яндекс маркет|\byandex market\b|ситилинк|маркетплейс/]
  ];
  const normalize = value => String(value || '').toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim();
  function classify(text, merchantRules) {
    const value = normalize(text);
    const hit = (Array.isArray(merchantRules) ? merchantRules : []).find(r => r && r.name && value.includes(normalize(r.name)) && CATEGORY_GROUPS.some(([, cats]) => cats.includes(r.category)));
    if (hit) return hit.category;
    return RULES.find(([, re]) => re.test(value))?.[0] || 'Другое';
  }
  function sourceOf(text) {
    const v = normalize(text);
    const firstLine = normalize(String(text || '').split(/\r?\n/)[0]);
    const header = normalize(String(text || '').split(/\r?\n/).slice(0, 2).join(' '));
    // «Яндекс Pay / Пополнение от меня со Сбербанка» — экран Яндекса, хотя в назначении есть Сбер.
    if (/сбер|sber/.test(firstLine)) return 'Сбербанк';
    if (/яндекс(?:[ .-]?(?:pay|пэй|пе[йи]|банк))|yandex(?:[ .-]?(?:pay|bank))|ya pay/.test(firstLine)) return 'Яндекс Банк';
    if (/^(?:яндекс|yandex)$/.test(firstLine)) return 'Яндекс Банк';
    if (/яндекс(?:[ .-]?(?:pay|пэй|пе[йи]|банк))|yandex(?:[ .-]?(?:pay|bank))|ya pay/.test(header)) return 'Яндекс Банк';
    if (/сбер|sber/.test(header)) return 'Сбербанк';
    if (/сбер|sber/.test(v)) return 'Сбербанк';
    if (/яндекс|yandex|ya pay|я\.пэй/.test(v)) return 'Яндекс Банк';
    if (/т-банк|тинькофф|tinkoff|t.bank/.test(v)) return 'Т-Банк';
    if (/альфа.?банк|alfabank|alfa.bank/.test(v)) return 'Альфа-Банк';
    if (/втб|\bvtb\b/.test(v)) return 'ВТБ';
    if (/озон банк|ozon банк/.test(v)) return 'Озон Банк';
    return 'Источник не определён';
  }
  const internalTransfer = s => /между сво(ими|их)|свою карт|свой сч[её]т|пополнени[ея] (?:моей )?(?:карты|сч[её]та)|перевод на свой|внутренний перевод|самому себе|между счетами|между сч[её]тами|на свой кошел[её]к/i.test(String(s || '')) || /(?:перевод|пополнени|сбп).{0,35}(?:яндекс(?:[ -]?(?:банк|пэй|pay|кошел[её]к))?|yandex(?: bank| pay)?)|(?:яндекс(?: банк| пэй)?|yandex(?: bank)?).{0,35}(?:на свой|свой счет|на сбер|в сбер)/i.test(String(s || ''));
  const fromKonstantin = s => /(?:^|[^а-яa-z])константин(?:а|у|ом)?(?:$|[^а-яa-z])/i.test(normalize(s));
  const genericTransfer = s => /перевод|сбп|по номеру телефон|физическ.{0,5}лиц|перевод на карт/i.test(String(s || ''));
  const income = s => /пополнени|зачислени|возврат|кешбэк|кэшбэк|поступлени|зарплат|входящ|от кого|получен|начислени|процент на остаток/i.test(String(s || ''));
  const summary = s => /за день|потрачено|всего|итого|общая сумма|все расход|расходы за|остаток|баланс|доступно|сумма операц|списано за день|кешбэк за|кэшбэк за|лимит|бонус|сегодня потрачен/i.test(String(s || ''));
  function parseAmount(s) {
    let value = String(s || '').replace(/[\u00a0\u202f]/g, ' ').replace(/₽|руб(?:лей|ля)?|р\./gi, '').replace(/\s/g, '').replace(',', '.');
    if (!/^\d{1,9}(?:\.\d{1,2})?$/.test(value)) return NaN;
    return Number(value);
  }
  const amountPattern = '(\\d{1,3}(?:[ .\\u00a0\\u202f]\\d{3})+(?:[.,]\\d{1,2})?|\\d{1,8}(?:[.,]\\d{1,2})?)';
  const amountAtEnd = new RegExp('([−–—\\-+]?)[ \\t]*' + amountPattern + '[ \\t]*(?:₽|Р|P|руб(?:лей|ля)?\\.?|р\\.)?[ \\t]*$', 'i');
  const noAmount = /^(?:\d{1,2}[:.]\d{2}|\*{0,4}\d{4}|карта.{0,12}\d{4}|сч[её]т.{0,10}\d{4}|операции|история|сегодня|вчера|позавчера|платежи|платеж|списания|расходы|оплата|переводы|поиск|подробнее|банк|доступно|сумма)$/i;
  const bankCategory = /^(?:супермаркеты?|продукты|рестораны?|кафе|фастфуд|транспорт|такси|топливо|азс|аптеки?|здоровье|медицина|одежда|обувь|маркетплейсы?|развлечения|связь|мобильная связь|интернет|коммунальные услуги|жкх|дом|ремонт|образование|красота|спорт|фитнес|животные|подписки|переводы?|покупки|услуги|оплата услуг|отели|путешествия|авиабилеты|каршеринг|доставка)$/i;
  function isoDay(y, m, d) {
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null;
  }
  function dayInLine(line, fallback, today) {
    const v = normalize(line); const now = new Date(today + 'T12:00:00');
    if (/^сегодня(?:\s|$)/.test(v)) return today;
    if (/^(вчера|позавчера)(?:\s|$)/.test(v)) { now.setDate(now.getDate() - (v.startsWith('позавчера') ? 2 : 1)); return isoDay(now.getFullYear(), now.getMonth() + 1, now.getDate()); }
    const m = v.match(/^(\d{1,2})[./-](\d{1,2})(?:[./-](20\d{2}|\d{2}))?$/);
    if (m) return isoDay(m[3] ? Number(m[3].length === 2 ? '20' + m[3] : m[3]) : now.getFullYear(), +m[2], +m[1]) || fallback;
    const named = v.match(/^(\d{1,2})\s+(январ|феврал|март|апрел|ма[йя]|июн|июл|август|сентябр|октябр|ноябр|декабр)[а-я]*(?:\s+(20\d{2}))?$/);
    if (named) { const months = ['январ','феврал','март','апрел','ма','июн','июл','август','сентябр','октябр','ноябр','декабр']; const mon = months.findIndex(x => named[2].startsWith(x)) + 1; return isoDay(+(named[3] || now.getFullYear()), mon, +named[1]) || fallback; }
    return null;
  }
  function cleanTitle(str) { return String(str || '').replace(/^[•·▪►>\s]+/, '').replace(/\b\d{1,2}:\d{2}\b/g, '').replace(/^(?:покупка|оплата|списание|платеж|платёж)\s+(?=\S)/i, '').replace(/[|]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  const qrPayment = text => /(?:^|[^a-z])qr(?:[^a-z]|$)|куар|оплат\p{L}*\s+(?:через|по)\s+сбп|сбп\s+оплат/iu.test(String(text || ''));

  function parseQrPayload(payload) {
    const value = String(payload || '').trim();
    let link;
    try { link = new URL(value); } catch {}
    if (link?.origin === 'https://qr.nspk.ru' && !link.username && !link.password) {
      const params = link.searchParams;
      if (!/^\/[a-z0-9]{32}$/i.test(link.pathname) || !/^(01|02)$/.test(params.get('type') || '')) return null;
      const sum = params.get('sum') || '';
      const valid = /^(?:RUB|643)$/.test(params.get('cur') || '') && /^\d{1,10}$/.test(sum);
      return { type: 'sbp', amount: valid && Number(sum) > 0 ? Number(sum) / 100 : null };
    }
    if (!/^[a-z]+=[^&]+(?:&[a-z]+=[^&]+)+$/i.test(value)) return null;
    const params = new URLSearchParams(value);
    if (!['fn', 'i', 'fp', 'n'].every(key => /^\d+$/.test(params.get(key) || ''))) return null;
    const stamp = params.get('t')?.match(/^(20\d{2})(\d{2})(\d{2})T(?:[01]\d|2[0-3])[0-5]\d$/);
    const date = stamp && isoDay(+stamp[1], +stamp[2], +stamp[3]);
    const amount = parseAmount(params.get('s'));
    const kind = {1: 'expense', 2: 'income', 3: 'income', 4: 'expense'}[params.get('n')];
    return date && kind && Number.isFinite(amount) && amount > 0 ? { type: 'fiscal', amount, date, kind } : null;
  }

  function parseScreenshotText(text, options = {}) {
    const now = options.today || new Date().toISOString().slice(0, 10);
    const lines = String(text || '').replace(/([\d])\s+([,.])\s*(\d{2})(?!\d)/g, '$1$2$3').split(/\r?\n/).map(s => s.replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
    const source = sourceOf(text); const list = []; let date = now; const used = new Set();
    const context = lines.some(l => /расходы|списания|история операций/i.test(l));
    function looksLikeName(line) { return !!line && !noAmount.test(line) && !summary(line) && (!income(line) || internalTransfer(line)) && !dayInLine(line, null, now) && !amountAtEnd.test(line) && !/^(?:₽|руб|карта|сч[её]т|сумма)/i.test(line); }
    function add(title, amount, signed, raw, subcategory) {
      title = cleanTitle(title); const value = parseAmount(amount);
      if (!title || title.length < 2 || title.length > 100 || !Number.isFinite(value) || value <= 0 || value > 5e7 || summary(title) || noAmount.test(title)) return;
      const pair = normalize(title + ' ' + subcategory);
      // Владелец подтвердил: исходящий перевод из Сбера на Яндекс Банк — между его счетами.
      // Яндекс Еда/Такси/Маркет/Плюс не попадают под исключение.
      const yandexBankPayee = source === 'Сбербанк' && /^(?:яндекс[ -]?(?:банк|пэй|pay|кошелек)|yandex (?:bank|pay))(?:\s|$)/.test(pair) && !/(еда|такси|маркет|плюс|лавка|go|food|market|покупка)/.test(pair);
      const internal = internalTransfer(pair) || yandexBankPayee;
      const payment = qrPayment(pair);
      const transfer = internal || (!payment && genericTransfer(pair));
      let category = classify(title, options.merchantRules);
      if (category === 'Другое' && subcategory) category = classify(subcategory, options.merchantRules);
      const bankUnsigned = !signed && source !== 'Источник не определён' && context;
      const selected = !transfer && category !== 'Другое' && (signed || bankUnsigned);
      const reason = internal ? 'Перевод между своими счетами — не расход'
        : transfer ? 'Перевод человеку: проверь назначение, не добавляю автоматически'
        : category === 'Другое' ? 'Не узнал категорию. Выбери её вручную'
        : !signed && !bankUnsigned ? 'Не вижу знак списания. Проверь операцию'
        : signed ? 'Сумма и категория распознаны' : 'В списке расходов без минуса. Проверь сумму';
      list.push({ id: options.id ? options.id() : 'scan-' + list.length, date, name: title, amount: value, category, kind: internal ? 'internal' : 'expense', paymentMethod: payment ? 'qr' : '', selected, reason, isTransfer: transfer, isInternal: internal, raw });
    }
    function addIncoming(title, amount, raw, details) {
      const value = parseAmount(amount);
      if (!Number.isFinite(value) || value <= 0 || value > 5e7) return;
      const name = cleanTitle(title) || 'Поступление';
      const context = normalize(name + ' ' + details);
      const konstantin = fromKonstantin(context);
      const fromSber = /сбер|sber/.test(context);
      const onYandex = source === 'Яндекс Банк';
      const clearlyOwn = /от меня|мои(?:х|ми)? сч|моего сч|моей карт|с мо(его|ей|их)|самому себе/.test(context);
      // Даже если имя отправителя OCR не прочёл, входящий Сбер → Яндекс не становится доходом автоматически.
      const ownTransfer = !konstantin && onYandex && fromSber && clearlyOwn;
      const needsCheck = !konstantin && onYandex && fromSber && !clearlyOwn;
      const kind = konstantin ? 'konstantin' : ownTransfer ? 'internal' : 'income';
      const reason = konstantin ? 'Константин — записываем отдельно от доходов и расходов'
        : ownTransfer ? 'Твои деньги из Сбера на Яндекс — не доход и не расход'
        : needsCheck ? 'Поступление из Сбера на Яндекс: проверь, не свой ли это перевод'
        : 'Поступление — сначала проверь отправителя';
      list.push({ id: options.id ? options.id() : 'scan-' + list.length, date, name: konstantin?'Перевод от Константина':name, amount: value,
        category: konstantin?'Переводы от Константина':'Другое', kind, selected:konstantin,
        reason, isTransfer: ownTransfer || needsCheck, isInternal:ownTransfer, raw });
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]; const maybeDate = dayInLine(line, null, now);
      if (maybeDate) { date = maybeDate; continue; }
      if (summary(line) || used.has(i)) continue;
      const match = line.match(amountAtEnd);
      if (match && match.index !== undefined) {
        const sign = match[1];
        const label = cleanTitle(line.slice(0, match.index));
        const incomingLike = sign === '+' || (sign !== '-' && !/[−–—]/.test(sign) && income(label));
        if (incomingLike) {
          const next = lines[i+1] || '', prev = lines[i-1] || '';
          const title = label || (looksLikeName(prev) || fromKonstantin(prev) ? prev : 'Поступление');
          addIncoming(title, match[2], line, [prev,next].join(' '));
          used.add(i);
          continue;
        }
        if (income(line) && !(/[−–—-]\s*\d/.test(line) && internalTransfer(line))) continue;
        const marked = /[−–—-]/.test(sign);
        let title = label;
        let catWord = bankCategory.test(lines[i + 1] || '') ? lines[i + 1] : '';
        if ((!title || bankCategory.test(title) || noAmount.test(title)) && looksLikeName(lines[i - 1]) && !used.has(i - 1)) {
          catWord = bankCategory.test(title) ? title : catWord; title = lines[i - 1]; used.add(i - 1);
        }
        if (catWord && title !== catWord) used.add(i + 1);
        add(title, match[2], marked, line, catWord); used.add(i); continue;
      }
      if (income(line) && !internalTransfer(line)) continue;
      const next = lines[i + 1];
      if (looksLikeName(line) && next && !used.has(i + 1)) {
        const amountMatch = next.match(amountAtEnd);
        if (amountMatch && amountMatch.index === 0 && amountMatch[1] === '+') {
          addIncoming(line, amountMatch[2], line + ' / ' + next, lines[i+2] || ''); used.add(i+1); i++;
        } else if (amountMatch && amountMatch.index === 0) {
          const marked = /[−–—-]/.test(amountMatch[1]);
          add(line, amountMatch[2], marked, line + ' / ' + next, ''); used.add(i + 1); i++;
        }
      }
    }
    const seen = new Set();
    for (const item of list) {
      const key = [normalize(item.name), item.date, item.amount].join('|');
      if (seen.has(key)) { item.selected = false; item.reason = 'Возможно, повторная строка — проверь'; }
      seen.add(key);
    }
    return { items: list, source, date, hasSummary: lines.some(summary), lineCount: lines.length };
  }
  function parseReceiptTotal(text, options = {}) {
    const lines = String(text || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    let total = NaN;
    for (let i = 0; i < lines.length; i++) {
      if (!/(?:^|\s)(итого|к оплате|всего к оплате|сумма чека|amount due|total)(?:\s|:|$)/i.test(lines[i])) continue;
      const candidates = [lines[i].replace(/^.*?(?:итого|к оплате|сумма чека|amount due|total)\s*:?\s*/i, ''), lines[i + 1] || ''];
      for (const c of candidates) { const hit = c.match(amountAtEnd); if (hit) { const n = parseAmount(hit[2]); if (n > 0) { total = n; break; } } }
      if (Number.isFinite(total)) break;
    }
    const merchant = lines.slice(0, 8).find(x => /[\p{L}]{3,}/u.test(x) && x.length < 70 && !/(кассовый|чек|фн|фд|фп|инн|дата|время|касса|сумма)/i.test(x));
    const name = cleanTitle(merchant).slice(0, 100);
    return { name: name || 'Покупка по чеку', hasMerchant: Boolean(name), amount: Number.isFinite(total) ? total : null, category: classify(name, options.merchantRules) };
  }
  return { CATEGORY_GROUPS, classify, sourceOf, isInternalTransfer: internalTransfer, isTransfer: genericTransfer, fromKonstantin, parseScreenshotText, parseReceiptTotal, parseQrPayload, isQrPayment: qrPayment };
});
