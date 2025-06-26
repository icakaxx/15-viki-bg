import { transporter, mailOptionSelf } from '../../../src/components/config/nodemailer'

const CONTACT_MESSAGE_FIELDS = {
  email: 'Email',
  phone: 'Телефон',
  roomSize: 'Колко кв.м. е помещението ви?',
  roomType: 'Вид помещение',
  insulation: 'Има ли изолация',
  exposure: 'С какво изложение е помещението',
  installationPreference: 'Имате ли предпочитание за вид монтаж?',
  heatingType: 'Основно или допълнително отопление?',
  desiredTemperature: 'Каква температура желаете да поддържа?',
  additionalField1: 'Допълнително поле 1',
  additionalField2: 'Допълнително поле 2',
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const data = req.body;

    // Validate required fields
    if (
  !data.email ||
  !data.phone ||
  (data.roomSize === undefined && data.additionalField1 === undefined) // example condition for required fields based on type
) {
  return res.status(400).json({ message: 'Bad Request' });
}


    try {
      await transporter.sendMail({
        ...mailOptionSelf,
        ...generateEmailContent(data),
        subject: 'Нова Заявка',
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: e.message });
    }
  }

  return res.status(400).json({ message: 'Bad Request' });
};

const generateEmailContent = (data) => {
  const stringData = Object.entries(CONTACT_MESSAGE_FIELDS).reduce((str, [key, label]) => {
    const value = data[key] || '—';
    return (str += `${label}: ${value}\n\n`);
  }, '');

  const htmlData = Object.entries(CONTACT_MESSAGE_FIELDS).reduce((str, [key, label]) => {
    const value = data[key] || '—';
    return (str += `
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 6px; font-size: 16px; color: #333;">${label}</h3>
        <p style="margin: 0; font-size: 15px; color: #555;">${value}</p>
      </div>
    `);
  }, '');

  return {
    text: stringData,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f9f9f9;
      padding: 24px;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.06);
    }
    h2 {
      font-size: 22px;
      margin-bottom: 20px;
      color: #222;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Благодарим ви за запитването!</h2>
    ${htmlData}
  </div>
</body>
</html>
`,
  };
};


export default handler;
