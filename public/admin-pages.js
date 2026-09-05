/**
 * Structured editors for inner CMS pages (About, Licenses, Advantages, Factory).
 * Loaded by admin.html after the main dashboard script helpers exist.
 */
(function () {
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function field(label, name, value, extra) {
    const multiline = extra && extra.multiline;
    const placeholder = (extra && extra.placeholder) || '';
    const id = 'pf-' + name.replace(/[^a-z0-9]+/gi, '-');
    const common =
      'data-page-field="' +
      escapeHtml(name) +
      '" id="' +
      id +
      '" placeholder="' +
      escapeHtml(placeholder) +
      '"';
    if (multiline) {
      return (
        '<label for="' +
        id +
        '">' +
        escapeHtml(label) +
        '</label><textarea ' +
        common +
        ' rows="' +
        (extra.rows || 3) +
        '">' +
        escapeHtml(value) +
        '</textarea>'
      );
    }
    return (
      '<label for="' +
      id +
      '">' +
      escapeHtml(label) +
      '</label><input type="text" ' +
      common +
      ' value="' +
      escapeHtml(value) +
      '" />'
    );
  }

  function card(title, body) {
    return (
      '<div class="page-card"><h3>' +
      escapeHtml(title) +
      '</h3>' +
      body +
      '</div>'
    );
  }

  function listItem(listName, index, body, extraButton) {
    return (
      '<div class="page-item" data-list-item="' +
      escapeHtml(listName) +
      '" data-index="' +
      index +
      '">' +
      body +
      '<div class="row"><button type="button" class="danger" data-remove-item>Remove</button>' +
      (extraButton || '') +
      '</div></div>'
    );
  }

  function renderFeatureList(namePrefix, items) {
    return (items || [])
      .map((item, index) =>
        listItem(
          namePrefix,
          index,
          field('Title', namePrefix + '.' + index + '.title', item.title) +
            field(
              'Description',
              namePrefix + '.' + index + '.description',
              item.description,
              { multiline: true }
            ) +
            field('Icon', namePrefix + '.' + index + '.icon', item.icon) +
            field('Image path / URL', namePrefix + '.' + index + '.image', item.image, {
              placeholder: '/images/… or https://…',
            })
        )
      )
      .join('');
  }

  function renderCardList(namePrefix, items) {
    return (items || [])
      .map((item, index) =>
        listItem(
          namePrefix,
          index,
          field('Title', namePrefix + '.' + index + '.title', item.title) +
            field('Subtitle', namePrefix + '.' + index + '.subtitle', item.subtitle) +
            field(
              'Description',
              namePrefix + '.' + index + '.description',
              item.description,
              { multiline: true }
            ) +
            field('Image path / URL', namePrefix + '.' + index + '.image', item.image, {
              placeholder: '/images/… or https://…',
            }) +
            field('Image alt', namePrefix + '.' + index + '.imageAlt', item.imageAlt)
        )
      )
      .join('');
  }

  function renderGallery(namePrefix, items) {
    return (items || [])
      .map((item, index) =>
        listItem(
          namePrefix,
          index,
          field('Image path / URL', namePrefix + '.' + index + '.url', item.url, {
            placeholder: '/images/… or https://…',
          }) + field('Alt', namePrefix + '.' + index + '.alt', item.alt)
        )
      )
      .join('');
  }

  function renderLeadership(namePrefix, items) {
    return (items || [])
      .map((item, index) =>
        listItem(
          namePrefix,
          index,
          field('Role / title', namePrefix + '.' + index + '.title', item.title) +
            field('Name', namePrefix + '.' + index + '.name', item.name) +
            field(
              'Experience',
              namePrefix + '.' + index + '.experience',
              item.experience
            ) +
            field('Image path / URL', namePrefix + '.' + index + '.image', item.image, {
              placeholder: '/images/… or https://…',
            }) +
            field('Image alt', namePrefix + '.' + index + '.imageAlt', item.imageAlt)
        )
      )
      .join('');
  }

  function renderOffices(namePrefix, items) {
    return (items || [])
      .map((item, index) => {
        const details = (item.details || [])
          .map(
            (detail, dIndex) =>
              '<div class="row">' +
              field(
                'Label',
                namePrefix + '.' + index + '.details.' + dIndex + '.label',
                detail.label
              ) +
              field(
                'Value',
                namePrefix + '.' + index + '.details.' + dIndex + '.value',
                detail.value
              ) +
              '</div>'
          )
          .join('');
        return listItem(
          namePrefix,
          index,
          field('Country', namePrefix + '.' + index + '.country', item.country) +
            field('Flag image', namePrefix + '.' + index + '.flagSrc', item.flagSrc, {
              placeholder: '/images/… or https://…',
            }) +
            field(
              'Office location',
              namePrefix + '.' + index + '.officeLocation',
              item.officeLocation
            ) +
            field(
              'License image',
              namePrefix + '.' + index + '.licenseImage',
              item.licenseImage,
              { placeholder: '/images/… or https://…' }
            ) +
            field(
              'License image alt',
              namePrefix + '.' + index + '.licenseImageAlt',
              item.licenseImageAlt
            ) +
            field(
              'Office image',
              namePrefix + '.' + index + '.officeImage',
              item.officeImage,
              { placeholder: '/images/… or https://…' }
            ) +
            field(
              'Office image alt',
              namePrefix + '.' + index + '.officeImageAlt',
              item.officeImageAlt
            ) +
            '<p class="hint">License details</p>' +
            details
        );
      })
      .join('');
  }

  function renderAdvantages(namePrefix, items) {
    return (items || [])
      .map((item, index) =>
        listItem(
          namePrefix,
          index,
          field('Number', namePrefix + '.' + index + '.number', item.number) +
            field('Title', namePrefix + '.' + index + '.title', item.title) +
            field('Subtitle', namePrefix + '.' + index + '.subtitle', item.subtitle) +
            field('Image path / URL', namePrefix + '.' + index + '.image', item.image, {
              placeholder: '/images/… or https://…',
            }) +
            field('Image alt', namePrefix + '.' + index + '.imageAlt', item.imageAlt) +
            field(
              'Points (one per line)',
              namePrefix + '.' + index + '.pointsText',
              (item.points || []).join('\n'),
              { multiline: true, rows: 5 }
            ) +
            field(
              'Side items (title | description, one per line)',
              namePrefix + '.' + index + '.sideItemsText',
              (item.sideItems || [])
                .map((side) => side.title + (side.description ? ' | ' + side.description : ''))
                .join('\n'),
              { multiline: true, rows: 4 }
            )
        )
      )
      .join('');
  }

  function renderAchievements(namePrefix, items) {
    return (items || [])
      .map((item, index) =>
        listItem(
          namePrefix,
          index,
          field('Title', namePrefix + '.' + index + '.title', item.title) +
            field(
              'Description',
              namePrefix + '.' + index + '.description',
              item.description,
              { multiline: true }
            ) +
            field(
              'Points (one per line)',
              namePrefix + '.' + index + '.pointsText',
              (item.points || []).join('\n'),
              { multiline: true, rows: 4 }
            ) +
            field('Image path / URL', namePrefix + '.' + index + '.image', item.image, {
              placeholder: '/images/… or https://…',
            }) +
            field('Image alt', namePrefix + '.' + index + '.imageAlt', item.imageAlt)
        )
      )
      .join('');
  }

  function renderStatistics(namePrefix, items) {
    return (items || [])
      .map((item, index) =>
        listItem(
          namePrefix,
          index,
          field('Value', namePrefix + '.' + index + '.value', item.value) +
            field('Label', namePrefix + '.' + index + '.label', item.label)
        )
      )
      .join('');
  }

  function sectionHeading(section, index) {
    return (
      (section.heading && section.heading.trim()) ||
      section.key ||
      'Section ' + (index + 1)
    );
  }

  function renderSection(section, index) {
    const prefix = 'sections.' + index;
    let lists = '';
    if (section.type === 'features') {
      lists =
        '<div data-list="' +
        prefix +
        '.features">' +
        renderFeatureList(prefix + '.features', section.features) +
        '</div><button type="button" class="secondary" data-add-list="' +
        prefix +
        '.features" data-kind="feature">Add feature</button>';
    } else if (section.type === 'cards') {
      lists =
        '<div data-list="' +
        prefix +
        '.cards">' +
        renderCardList(prefix + '.cards', section.cards) +
        '</div><button type="button" class="secondary" data-add-list="' +
        prefix +
        '.cards" data-kind="card">Add card</button>';
    } else if (section.type === 'gallery') {
      lists =
        '<div data-list="' +
        prefix +
        '.gallery">' +
        renderGallery(prefix + '.gallery', section.gallery) +
        '</div><button type="button" class="secondary" data-add-list="' +
        prefix +
        '.gallery" data-kind="image">Add image</button>';
    } else if (section.type === 'leadership') {
      lists =
        '<div data-list="' +
        prefix +
        '.leadership">' +
        renderLeadership(prefix + '.leadership', section.leadership) +
        '</div><button type="button" class="secondary" data-add-list="' +
        prefix +
        '.leadership" data-kind="leader">Add leader</button>';
    } else if (section.type === 'offices') {
      lists =
        '<div data-list="' +
        prefix +
        '.offices">' +
        renderOffices(prefix + '.offices', section.offices) +
        '</div><button type="button" class="secondary" data-add-list="' +
        prefix +
        '.offices" data-kind="office">Add office</button>';
    } else if (section.type === 'market-advantages') {
      lists =
        '<div data-list="' +
        prefix +
        '.marketAdvantages">' +
        renderAdvantages(prefix + '.marketAdvantages', section.marketAdvantages) +
        '</div><button type="button" class="secondary" data-add-list="' +
        prefix +
        '.marketAdvantages" data-kind="advantage">Add advantage</button>';
    } else if (section.type === 'achievements') {
      lists =
        '<div data-list="' +
        prefix +
        '.achievements">' +
        renderAchievements(prefix + '.achievements', section.achievements) +
        '</div><button type="button" class="secondary" data-add-list="' +
        prefix +
        '.achievements" data-kind="achievement">Add achievement</button>';
    } else if (section.type === 'statistics') {
      lists =
        '<div data-list="' +
        prefix +
        '.statistics">' +
        renderStatistics(prefix + '.statistics', section.statistics) +
        '</div><button type="button" class="secondary" data-add-list="' +
        prefix +
        '.statistics" data-kind="stat">Add stat</button>';
    }

    return card(
      sectionHeading(section, index),
      field('Section heading', prefix + '.heading', section.heading) +
        field('Section subheading', prefix + '.subheading', section.subheading) +
        field('Section description', prefix + '.description', section.description, {
          multiline: true,
        }) +
        field('Section image path / URL', prefix + '.image', section.image, {
          placeholder: '/images/… or https://…',
        }) +
        field('Section image alt', prefix + '.imageAlt', section.imageAlt) +
        (section.type === 'achievements'
          ? field('Badge text', prefix + '.icon', section.icon, {
              placeholder: 'e.g. 06',
            })
          : '') +
        lists
    );
  }

  function buildPageFormHtml(page) {
    const hero = page.hero || {};
    const sections = Array.isArray(page.sections) ? page.sections : [];
    return (
      field('Page title', 'title', page.title) +
      field('Public slug', 'slug', page.slug) +
      field('Browser tab title', 'metaTitle', page.metaTitle) +
      field('Search description', 'metaDescription', page.metaDescription, {
        multiline: true,
        rows: 2,
      }) +
      '<label><input type="checkbox" data-page-field="isActive"' +
      (page.isActive !== false ? ' checked' : '') +
      ' /> Active (visible on the website)</label>' +
      card(
        'Hero',
        field('Heading', 'hero.heading', hero.heading) +
          field('Subheading', 'hero.subheading', hero.subheading) +
          field('Description / tagline', 'hero.description', hero.description, {
            multiline: true,
          }) +
          field('Logo path / URL', 'hero.logoSrc', hero.logoSrc, {
            placeholder: '/images/… or https://…',
          }) +
          field('Hero image path / URL', 'hero.image', hero.image, {
            placeholder: '/images/… or https://…',
          }) +
          field('Hero image alt', 'hero.imageAlt', hero.imageAlt) +
          field('Background image path / URL', 'hero.backgroundImage', hero.backgroundImage, {
            placeholder: '/images/… or https://…',
          }) +
          field('Brand tagline', 'hero.brandTagline', hero.brandTagline)
      ) +
      sections.map(renderSection).join('')
    );
  }

  function setByPath(target, path, value) {
    const parts = path.split('.');
    let cursor = target;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const key = parts[i];
      const next = parts[i + 1];
      const nextIsIndex = /^\d+$/.test(next);
      if (cursor[key] == null) cursor[key] = nextIsIndex ? [] : {};
      cursor = cursor[key];
    }
    cursor[parts[parts.length - 1]] = value;
  }

  function emptyItem(kind) {
    if (kind === 'feature') return { title: 'New feature', description: '', icon: '', image: '' };
    if (kind === 'card') {
      return { title: 'New card', subtitle: '', description: '', image: '', imageAlt: '' };
    }
    if (kind === 'image') return { url: '', alt: '' };
    if (kind === 'leader') {
      return { title: 'Title', name: 'Name', experience: '', image: '', imageAlt: '' };
    }
    if (kind === 'office') {
      return {
        country: 'New office',
        flagSrc: '',
        officeLocation: '',
        licenseImage: '',
        licenseImageAlt: '',
        officeImage: '',
        officeImageAlt: '',
        details: [{ label: 'LICENSE TYPE', value: '' }],
      };
    }
    if (kind === 'advantage') {
      return { number: '', title: 'New advantage', subtitle: '', image: '', imageAlt: '', points: [], sideItems: [] };
    }
    if (kind === 'achievement') {
      return { title: 'New achievement', description: '', points: [], image: '', imageAlt: '' };
    }
    if (kind === 'stat') return { value: '', label: '' };
    return {};
  }

  function collectInnerPageForm(base) {
    const root = document.getElementById('pageForm');
    const next = JSON.parse(JSON.stringify(base || {}));
    delete next._id;
    delete next.__v;
    delete next.createdAt;
    delete next.updatedAt;
    if (!next.hero) next.hero = {};
    if (!Array.isArray(next.sections)) next.sections = [];

    root.querySelectorAll('[data-page-field]').forEach((input) => {
      const path = input.getAttribute('data-page-field');
      if (input.type === 'checkbox') {
        setByPath(next, path, input.checked);
        return;
      }
      setByPath(next, path, input.value);
    });

    (next.sections || []).forEach((section) => {
      (section.marketAdvantages || []).forEach((block) => {
        if (typeof block.pointsText === 'string') {
          block.points = block.pointsText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
          delete block.pointsText;
        }
        if (typeof block.sideItemsText === 'string') {
          block.sideItems = block.sideItemsText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [title, description] = line.split('|').map((part) => part.trim());
              return { title, description: description || '' };
            });
          delete block.sideItemsText;
        }
      });
      (section.achievements || []).forEach((item) => {
        if (typeof item.pointsText === 'string') {
          item.points = item.pointsText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
          delete item.pointsText;
        }
      });
    });

    return next;
  }

  function renderInnerPageForm(page) {
    const root = document.getElementById('pageForm');
    const advanced = document.getElementById('pageJsonWrap');
    if (!root) return;
    if (!page || page.pageType === 'home' || page.pageType === 'custom') {
      root.innerHTML =
        '<p class="hint">This page uses the raw JSON editor below. Home body content is edited under <strong>Home page</strong>.</p>';
      if (advanced) advanced.open = true;
      return;
    }
    root.innerHTML = buildPageFormHtml(page);
    if (advanced) advanced.open = false;
    if (typeof installMediaPickerButtons === 'function') {
      installMediaPickerButtons(root);
    }
  }

  function bindPageFormEvents() {
    const root = document.getElementById('pageForm');
    if (!root || root.dataset.bound) return;
    root.dataset.bound = '1';
    root.addEventListener('click', (event) => {
      const addBtn = event.target.closest('[data-add-list]');
      const removeBtn = event.target.closest('[data-remove-item]');
      if (!addBtn && !removeBtn) return;
      const json = document.getElementById('pageJson');
      const current = JSON.parse(json.value || '{}');
      const draft = collectInnerPageForm(current);
      if (addBtn) {
        const path = addBtn.getAttribute('data-add-list');
        const kind = addBtn.getAttribute('data-kind');
        const parts = path.split('.');
        let cursor = draft;
        for (let i = 0; i < parts.length - 1; i += 1) {
          const key = parts[i];
          if (cursor[key] == null) cursor[key] = /^\d+$/.test(parts[i + 1]) ? [] : {};
          cursor = cursor[key];
        }
        const key = parts[parts.length - 1];
        if (!Array.isArray(cursor[key])) cursor[key] = [];
        cursor[key].push(emptyItem(kind));
      }
      if (removeBtn) {
        const item = removeBtn.closest('[data-list-item]');
        const listName = item.getAttribute('data-list-item');
        const index = Number(item.getAttribute('data-index'));
        const parts = listName.split('.');
        let cursor = draft;
        for (let i = 0; i < parts.length - 1; i += 1) cursor = cursor[parts[i]];
        const key = parts[parts.length - 1];
        if (Array.isArray(cursor[key])) cursor[key].splice(index, 1);
      }
      document.getElementById('pageJson').value = JSON.stringify(draft, null, 2);
      renderInnerPageForm(draft);
    });
  }

  window.renderInnerPageForm = renderInnerPageForm;
  window.collectInnerPageForm = collectInnerPageForm;
  window.bindPageFormEvents = bindPageFormEvents;
})();
