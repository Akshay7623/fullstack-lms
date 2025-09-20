export default function buildEmailHtml(editorContent) {
  const emailWrapperCss = `
.email-wrapper {
  padding: 10px 10px;
  border-radius: 8px;
  margin: auto;
  font-family: Arial, sans-serif;
  min-height: 300px;
  outline: none;
  background: #fff;
  color: #333;
}
.email-wrapper h1,
.email-wrapper h2 {
  font-size: 20px;
  margin-bottom: 10px;
  font-weight: 700;
  color: #333;
}
.email-wrapper h3 {
  margin-top: 30px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #444;
}
  
.email-wrapper table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}
.email-wrapper td,
.email-wrapper th {
  padding: 6px 8px;
  border-bottom: 1px solid #eee;
  color: #333;
}
.email-wrapper td:first-child,
.email-wrapper th:first-child {
  font-weight: bold;
  width: 150px;
  color: #333;
}
.email-wrapper a {
  text-decoration: none;
  color: #0066cc;
}
.email-wrapper a:hover {
  text-decoration: underline;
}
.email-wrapper .note {
  padding: 12px;
  border-left: 4px solid #0073e6;
  margin-bottom: 20px;
  background: #f9f9f9;
  color: #333;
}
.email-wrapper .image_logo {
  height: 30px;
}
.email-wrapper .footer {
  font-size: 12px;
  border-top: 1px solid #eee;
  padding-top: 15px;
  margin-top: 20px;
  color: #777;
}
.email-wrapper p {
  margin: 0 0 1em 0;
}
.email-wrapper strong {
  font-weight: bold;
}
.email-wrapper em {
  font-style: italic;
}
.email-wrapper img {
  width: 200px;
  height: 150px;
  object-fit: contain;
}
`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>${emailWrapperCss}</style>
</head>
<body>
  <div class="email-wrapper">
    ${editorContent}
  </div>
</body>
</html>
`;
}
