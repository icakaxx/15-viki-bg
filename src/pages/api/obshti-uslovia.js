export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get language from query parameter or default to 'bg'
  const lang = req.query.lang || 'bg';

  const termsText = {
    bg: `
      <h1>ОБЩИ УСЛОВИЯ ЗА ПОЛЗВАНЕ И ПОКУПКА ПРЕЗ САЙТА BG-VIKI15.BG</h1>
      
      <h2>1. Данни за търговеца</h2>
      <p>Собственик на уебсайта www.bgviki15.bg е „БГВИКИ15" ЕООД, със седалище и адрес на управление: гр. Плевен, бл. 319, вх. В, ет. 5, ЕИК 206631138, регистрирана по ЗДДС.</p>
      
      <p><strong>Имейл:</strong> bgviki.ltd@abv.bg</p>
      <p><strong>Телефон:</strong> +359 895 460 717</p>
      
      <h2>2. Предмет на общите условия</h2>
      <p>Настоящите условия уреждат използването на уебсайта и правилата за поръчка, плащане, доставка, монтаж и връщане на продукти (климатици и свързано оборудване), предлагани чрез bgviki15.bg.</p>
      
      <h2>3. Поръчка на стоки</h2>
      <p>Потребителите могат да правят поръчки чрез сайта, като попълнят необходимата информация – име, адрес, телефон и др. След подаване на поръчка, клиентът получава потвърждение по имейл или телефон.</p>
      
      <h2>4. Цени и плащане</h2>
      <p>Всички цени са в български лева с включен ДДС.</p>
      
      <p><strong>Предлагани методи на плащане:</strong></p>
      <ul>
        <li>Наложен платеж при доставка</li>
        <li>Плащане на място (в брой или с карта)</li>
        <li>Онлайн плащане (при наличност на такава опция)</li>
      </ul>
      
      <h2>5. Доставка</h2>
      <p>Доставки се извършват чрез куриерска фирма или чрез партньори. Срок за доставка: от 1 до 3 работни дни, освен ако не е уговорено друго.</p>
      
      <h2>6. Монтаж и инсталация</h2>
      <p>Фирмата предлага монтаж и инсталация на закупените климатици. Стандартният монтаж е безплатен до 3 линейни метра (тръбен път). При необходимост от допълнителни метри, клиентът заплаща допълнителна такса съгласно актуалната тарифа.</p>
      
      <p><strong>Монтажът включва:</strong></p>
      <ul>
        <li>Пробиване на една стена</li>
        <li>Връзка между вътрешно и външно тяло</li>
        <li>Пускане и проверка</li>
      </ul>
      
      <p>Допълнителни услуги (напр. работа на труднодостъпни места, допълнителни пробивания, стойки и др.) се заплащат отделно.</p>
      
      <h2>7. Право на отказ и връщане</h2>
      <p>Съгласно Закона за защита на потребителите, клиентът има право да се откаже от покупката в срок до 14 дни след получаване, без да посочва причина. Разходите за връщане са за сметка на клиента. Стоката трябва да е в оригинален търговски вид и с ненарушена опаковка.</p>
      
      <h2>8. Гаранция и рекламации</h2>
      <p>Продуктите се предлагат с гаранция от минимум 24 месеца, освен ако не е посочено друго. Рекламации се приемат по имейл: bgviki.ltd@abv.bg. За валидна гаранция клиентът трябва да пази документа за покупка и гаранционната карта.</p>
      
      <h2>9. Лични данни</h2>
      <p>„БГВИКИ15" ЕООД спазва изискванията на GDPR. За повече информация – виж Политика за поверителност.</p>
      
      <h2>10. Авторски права</h2>
      <p>Всички текстове, изображения и съдържание на bgviki15.bg са защитени с авторско право и не могат да се използват без писмено съгласие.</p>
      
      <h2>11. Промени в условията</h2>
      <p>„БГВИКИ15" ЕООД си запазва правото да променя настоящите условия без предварително уведомление. Последната версия е винаги достъпна на сайта.</p>
    `,
    en: `
      <h1>TERMS AND CONDITIONS FOR USE AND PURCHASE THROUGH THE BG-VIKI15.BG WEBSITE</h1>
      
      <h2>1. Merchant Information</h2>
      <p>The owner of the website www.bgviki15.bg is "BGVIKI15" Ltd., with registered office and management address: Pleven, bl. 319, ent. V, fl. 5, UIC 206631138, registered for VAT.</p>
      
      <p><strong>Email:</strong> bgviki.ltd@abv.bg</p>
      <p><strong>Phone:</strong> +359 895 460 717</p>
      
      <h2>2. Subject of the Terms and Conditions</h2>
      <p>These terms govern the use of the website and the rules for ordering, payment, delivery, installation, and return of products (air conditioners and related equipment) offered through bgviki15.bg.</p>
      
      <h2>3. Product Ordering</h2>
      <p>Users can place orders through the website by filling in the required information - name, address, phone number, etc. After submitting an order, the customer receives confirmation by email or phone.</p>
      
      <h2>4. Prices and Payment</h2>
      <p>All prices are in Bulgarian Lev including VAT.</p>
      
      <p><strong>Available payment methods:</strong></p>
      <ul>
        <li>Cash on delivery</li>
        <li>Payment on site (cash or card)</li>
        <li>Online payment (when such option is available)</li>
      </ul>
      
      <h2>5. Delivery</h2>
      <p>Deliveries are made through a courier company or partners. Delivery time: 1 to 3 business days, unless otherwise agreed.</p>
      
      <h2>6. Installation and Setup</h2>
      <p>The company offers installation and setup of purchased air conditioners. Standard installation is free up to 3 linear meters (pipe route). If additional meters are needed, the customer pays an additional fee according to the current tariff.</p>
      
      <p><strong>The installation includes:</strong></p>
      <ul>
        <li>Drilling one wall</li>
        <li>Connection between indoor and outdoor unit</li>
        <li>Start-up and testing</li>
      </ul>
      
      <p>Additional services (e.g., work in hard-to-reach places, additional drilling, stands, etc.) are charged separately.</p>
      
      <h2>7. Right of Withdrawal and Return</h2>
      <p>According to the Consumer Protection Act, the customer has the right to withdraw from the purchase within 14 days of receipt without stating a reason. Return costs are at the customer's expense. The goods must be in original commercial condition and with undamaged packaging.</p>
      
      <h2>8. Warranty and Complaints</h2>
      <p>Products are offered with a minimum 24-month warranty, unless otherwise specified. Complaints are accepted by email: bgviki.ltd@abv.bg. For valid warranty, the customer must keep the purchase document and warranty card.</p>
      
      <h2>9. Personal Data</h2>
      <p>"BGVIKI15" Ltd. complies with GDPR requirements. For more information - see Privacy Policy.</p>
      
      <h2>10. Copyright</h2>
      <p>All texts, images, and content on bgviki15.bg are protected by copyright and may not be used without written consent.</p>
      
      <h2>11. Changes to Terms</h2>
      <p>"BGVIKI15" Ltd. reserves the right to change these terms without prior notice. The latest version is always available on the website.</p>
    `
  };

  res.status(200).json({
    terms: termsText[lang] || termsText.bg, // Fallback to Bulgarian if language not found
    version: '1.0',
    lastUpdated: '2024-01-01',
    language: lang
  });
} 