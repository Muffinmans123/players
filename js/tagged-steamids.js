const saveColorTag = (steamId, color) => {
  const colorTags = JSON.parse(localStorage.getItem('colorTags')) || {};
  if (!colorTags[steamId]) {
    colorTags[steamId] = [];
  }
  if (!colorTags[steamId].includes(color)) {
    colorTags[steamId].push(color);
  }
  localStorage.setItem('colorTags', JSON.stringify(colorTags));
};

const saveGroupName = (color, groupName) => {
  const groupNames = JSON.parse(localStorage.getItem('groupNames')) || {};
  groupNames[color] = groupName;
  localStorage.setItem('groupNames', JSON.stringify(groupNames));
  renderTaggedSteamIds();
};

const removeColorTag = (steamId, color) => {
  const colorTags = JSON.parse(localStorage.getItem('colorTags')) || {};
  if (colorTags[steamId]) {
    colorTags[steamId] = colorTags[steamId].filter(c => c !== color);
    if (colorTags[steamId].length === 0) {
      delete colorTags[steamId];
    }
    localStorage.setItem('colorTags', JSON.stringify(colorTags));
  }
};

const STEAM_PROFILE_URL = 'https://steamcommunity.com/profiles/%id%';

const renderTaggedSteamIds = () => {
  const taggedSteamIdsTableBody = document.querySelector('#tagged-steamids-table tbody');
  const colorTags = JSON.parse(localStorage.getItem('colorTags')) || {};
  const groupNames = JSON.parse(localStorage.getItem('groupNames')) || {};
  taggedSteamIdsTableBody.innerHTML = '';

  const groupedByColor = {};

  // Group Steam IDs by color
  Object.keys(colorTags).forEach((steamId) => {
    const colors = Array.isArray(colorTags[steamId]) ? colorTags[steamId] : [];
    colors.forEach((color) => {
      if (!groupedByColor[color]) {
        groupedByColor[color] = [];
      }
      groupedByColor[color].push(steamId);
    });
  });

  let rowIndex = 1; // Initialize row index counter

  // Render grouped Steam IDs
  Object.keys(groupedByColor).forEach((color) => {
    const groupName = groupNames[color] || '';
    const steamIds = groupedByColor[color];
    const colorRow = document.createElement('tr');
    const colorTd = document.createElement('td');
    colorTd.colSpan = 5; // Adjust colspan to match the number of columns
    colorTd.textContent = `Color: ${color} - Group: ${groupName}`;
    colorTd.style.backgroundColor = color;
    colorRow.appendChild(colorTd);
    taggedSteamIdsTableBody.appendChild(colorRow);

    steamIds.forEach((steamId) => {
      const tr = document.createElement('tr');

      const noTd = document.createElement('td');
      noTd.textContent = rowIndex++ + '.'; // Set row number with a period

      const steamIdTd = document.createElement('td');
      steamIdTd.textContent = steamId;

      const steamLinkTd = document.createElement('td');
      const steamLink = document.createElement('a');
      steamLink.href = STEAM_PROFILE_URL.replace('%id%', steamId);
      steamLink.target = '_blank';
      steamLink.innerHTML = '<img src="img/steam.svg" alt="Steam" style="width: 22px;">';
      steamLinkTd.appendChild(steamLink);

      const colorTd = document.createElement('td');
      colorTd.textContent = colorTags[steamId].join('/');
      if (colorTags[steamId].length === 1) {
        colorTd.style.backgroundColor = colorTags[steamId][0];
      } else if (colorTags[steamId].length === 2) {
        colorTd.style.background = `linear-gradient(90deg, ${colorTags[steamId][0]} 50%, ${colorTags[steamId][1]} 50%)`;
      } else if (colorTags[steamId].length === 3) {
        colorTd.style.background = `linear-gradient(90deg, ${colorTags[steamId][0]} 33.33%, ${colorTags[steamId][0]} 33.33%, ${colorTags[steamId][1]} 33.33%, ${colorTags[steamId][1]} 66.66%, ${colorTags[steamId][2]} 66.66%, ${colorTags[steamId][2]} 100%)`;
      } else {
        colorTd.style.background = `linear-gradient(90deg, ${colorTags[steamId].join(', ')})`;
      }

      const actionsTd = document.createElement('td');
      actionsTd.className = 'actions';

      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.onclick = () => {
        removeColorTag(steamId, color);
        renderTaggedSteamIds();
      };

      actionsTd.appendChild(removeButton);

      tr.appendChild(noTd);
      tr.appendChild(steamIdTd);
      tr.appendChild(steamLinkTd);
      tr.appendChild(colorTd);
      tr.appendChild(actionsTd);

      taggedSteamIdsTableBody.appendChild(tr);
    });
  });
};

const colorPicker = document.querySelector('#color-picker');
const colorHex = document.querySelector('#color-hex');

colorPicker.addEventListener('input', () => {
  colorHex.value = colorPicker.value;
});

colorHex.addEventListener('input', () => {
  if (/^#[0-9A-F]{6}$/i.test(colorHex.value)) {
    colorPicker.value = colorHex.value;
  }
});

document.querySelector('#apply-color').addEventListener('click', () => {
  const color = colorPicker.value;
  const steamIds = document.querySelector('#steam-id-input').value.trim().split('\n');
  steamIds.forEach(steamId => {
    if (steamId) {
      saveColorTag(steamId.trim(), color);
    }
  });
  renderTaggedSteamIds();
});

document.querySelector('#apply-group-name').addEventListener('click', () => {
  const color = colorPicker.value;
  const groupName = document.querySelector('#group-name-input').value.trim();
  if (color && groupName) {
    saveGroupName(color, groupName);
  }
});

window.addEventListener('storage', (event) => {
  if (event.key === 'colorTags' || event.key === 'groupNames') {
    renderTaggedSteamIds();
  }
});

renderTaggedSteamIds();