const form = document.querySelector('form');
const promptInput = document.getElementById('prompt-input');
const urlInput = document.getElementById('url-input');
const modeSelect = document.getElementById('mode-select');
const imageContainer = document.getElementById('image-container');
const visionContainer = document.getElementById('vision-container');

// プロンプト入力フィールドのイベントリスナー
promptInput.addEventListener('input', () => {
  if (promptInput.value !== '') {
    urlInput.disabled = true;  // URL入力を無効化
    modeSelect.disabled = true; // モード選択を無効化
  } else {
    urlInput.disabled = false; // URL入力を有効化
    modeSelect.disabled = false; // モード選択を有効化
  }
});

// URL入力フィールドのイベントリスナー
urlInput.addEventListener('input', () => {
  if (urlInput.value !== '') {
    promptInput.disabled = true;  // プロンプト入力を無効化
    modeSelect.disabled = true; // モード選択を無効化
  } else {
    promptInput.disabled = false; // プロンプト入力を有効化
    modeSelect.disabled = false; // モード選択を有効化
  }
});

// モード選択のイベントリスナー
modeSelect.addEventListener('change', () => {
  if (modeSelect.value === '') {
    promptInput.disabled = false; // プロンプト入力を有効化
    urlInput.disabled = false;  // URL入力を無効化
  } else {
    promptInput.disabled = true;  // プロンプト入力を無効化
    urlInput.disabled = true; // URL入力を有効化
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const promptValue = promptInput.value;
  const urlValue = urlInput.value;
  const modeValue = modeSelect.value;

  // 入力によって、関数を変更
  if (promptValue) {
    generateImage(promptValue);
  } else if (urlValue) {
    generateVision(urlValue);
  } else if (modeValue === 'edits') {
    generateEdits();
  } else if (modeValue === 'variations') {
    generateVariations();
  }

  // 入力フィールドを再度有効化
  promptInput.disabled = false;
  urlInput.disabled = false;
  modeSelect.disabled = false;

  // 入力フィールドをクリア
  promptInput.value = '';
  urlInput.value = '';
  modeSelect.value = '';
});

async function generateImage(prompt) {
  try {
    const response = await fetch('http://localhost:3000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.image) {
      const imageElement = document.createElement('img');
      imageElement.src = data.image;
      imageContainer.appendChild(imageElement);
    } else {
      throw new Error('画像URLがレスポンスに含まれていません。');
    }

  } catch (error) {
    console.error('画像の生成に失敗しました。', error);
  }
}

async function generateVision(url) {
  try {
    const response = await fetch('http://localhost:3000/generateVision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url })
    });

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.message.content) {
      const visionElement = document.createElement('p');
      visionElement.textContent = data.message.content;
      visionContainer.appendChild(visionElement);
    } else {
      throw new Error('説明文がレスポンスに含まれていません。');
    }

  } catch (error) {
    console.error('説明文の生成に失敗しました。', error);
  }
}

async function generateEdits() {
  try {
    const response = await fetch('http://localhost:3000/generateEdits', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Server responded with error: ${errorText}`);
    }

    const data = await response;
    console.log(data)
    if (data) {
      const imageElement = document.createElement('img');
      imageElement.src = data.image;
      imageContainer.appendChild(imageElement);
    } else {
      throw new Error('画像URLがレスポンスに含まれていません。');
    }

  } catch (error) {
    console.error('画像の生成に失敗しました。', error);
  }
}