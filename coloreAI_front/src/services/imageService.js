const API_URL = 'http://localhost:3000';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/api/images/upload`, {
    method: 'POST',
    headers: {
      // NÃO defina Content-Type: o navegador coloca o boundary do multipart sozinho
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Falha no envio.');
  }

  return data.image; // { id, storage_path, original_name, url, ... }
}