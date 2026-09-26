/**
 * Structured editors for inner CMS pages (About, Licenses, Advantages, Factory, Management Galleries, Sales & Purchase, Contact Us).
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

  function hiddenField(name, value) {
    return (
      '<input type="hidden" data-page-field="' +
      escapeHtml(name) +
      '" value="' +
      escapeHtml(value ?? '') +
      '" />'
    );
  }

  const CROP_HINTS = {
    hero: '12∶5 · 1200×500 · homepage slider',
    portrait: '3∶4 · 640×854 · portrait card',
    gallery: '2∶1 · 720×360 · wide tile',
    square: '1∶1 · 800×800 · square tile',
    process: '4∶3 · 800×600 · process / product card',
    banner: '16∶7 · 1280×560 · wide banner',
    collage: '8∶3 · 960×360 · collage tile',
    logo: '3∶1 · 600×200 · logo',
    icon: '1∶1 · 256×256 · icon',
    certificate: '3∶4 · 900×1200 · certificate',
    flag: '1∶1 · 256×256 · circular flag',
    general: 'free crop — keep the subject centered',
    wideBand: '4∶1 · 1280×320 · full-width band',
  };

  function field(label, name, value, extra) {
    const multiline = extra && extra.multiline;
    const placeholder = (extra && extra.placeholder) || '';
    const crop = extra && extra.crop;
    const id = 'pf-' + name.replace(/[^a-z0-9]+/gi, '-');
    const common =
      'data-page-field="' +
      escapeHtml(name) +
      '" id="' +
      id +
      '" placeholder="' +
      escapeHtml(placeholder) +
      '"' +
      (crop ? ' data-crop-preset="' + escapeHtml(crop) + '"' : '');
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
    const inputHtml =
      '<label for="' +
      id +
      '">' +
      escapeHtml(label) +
      '</label><input type="text" ' +
      common +
      ' value="' +
      escapeHtml(value) +
      '" />';
    const mediaHint = placeholder.toLowerCase();
    const isMediaField =
      /(\/images\/|\/uploads\/|\/videos\/)/.test(mediaHint) &&
      !/tel:|mailto:/.test(mediaHint);
    if (!isMediaField) return inputHtml;
    const previewSrc = String(value || '').trim() || '/images/media-fallback.svg';
    const sizeHint = crop && CROP_HINTS[crop]
      ? '<p class="hint">Website frame: ' +
        CROP_HINTS[crop] +
        '. Use <strong>Upload &amp; crop</strong> to preview before saving.</p>'
      : '<p class="hint">Use <strong>Upload &amp; crop</strong> to preview how this image will appear on the website.</p>';
    return (
      inputHtml +
      '<img class="hrg-thumb-preview"' +
      (String(value || '').trim() ? '' : ' data-placeholder="true"') +
      ' alt="' +
      (String(value || '').trim() ? 'Image preview' : 'Image coming soon') +
      '" src="' +
      escapeHtml(previewSrc) +
      '" onerror="this.onerror=null;this.src=\'/images/media-fallback.svg\';this.dataset.placeholder=\'true\'" />' +
      sizeHint
    );
  }

  function heroImageCrop(pageType) {
    if (pageType === 'about') return 'portrait';
    if (pageType === 'factory-refinery') return 'general';
    if (pageType === 'market-advantages') return 'process';
    return 'gallery';
  }

  function sectionImageCrop(pageType, section) {
    if (pageType === 'factory-refinery') return 'wideBand';
    if (pageType === 'about' && section && section.key === 'commitment') return 'gallery';
    if (pageType === 'about') return 'process';
    return 'gallery';
  }

  function galleryCrop(pageType, section) {
    const blob = (((section && section.key) || '') + ' ' + ((section && section.heading) || '')).toLowerCase();
    if (pageType === 'about' && /department/.test(blob)) return 'process';
    if (pageType === 'about' && /collection/.test(blob)) return 'square';
    if (/event|office|purchase|buy/.test(blob)) return 'collage';
    return 'square';
  }

  function cardImageCrop(pageType) {
    if (pageType === 'factory-refinery') return 'process';
    return 'portrait';
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
              crop: 'process',
            })
        )
      )
      .join('');
  }

  function renderCardList(namePrefix, items, crop) {
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
              crop: crop || 'portrait',
            }) +
            field('Image alt', namePrefix + '.' + index + '.imageAlt', item.imageAlt) +
            field('Link URL', namePrefix + '.' + index + '.link', item.link, {
              placeholder: 'tel:… mailto:… or https://…',
            })
        )
      )
      .join('');
  }

  function renderGallery(namePrefix, items, crop) {
    return (items || [])
      .map((item, index) =>
        listItem(
          namePrefix,
          index,
          field('Image path / URL', namePrefix + '.' + index + '.url', item.url, {
            placeholder: '/images/… or https://…',
            crop: crop || 'square',
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
              crop: 'portrait',
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
              crop: 'flag',
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
              { placeholder: '/images/… or https://…', crop: 'certificate' }
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
              { placeholder: '/images/… or https://…', crop: 'process' }
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
              crop: 'square',
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
              crop: 'process',
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

  function isManagementGallery(pageType) {
    return pageType === 'management-gallery';
  }

  function isSalesPurchase(pageType) {
    return pageType === 'sales-purchase';
  }

  function isContactUs(pageType) {
    return pageType === 'contact-us';
  }

  function isCompactInnerPage(pageType) {
    return isManagementGallery(pageType) || isSalesPurchase(pageType) || isContactUs(pageType);
  }

  function sectionHeading(pageType, section, index) {
    if (isManagementGallery(pageType)) {
      if (section.key === 'leadership' || section.type === 'leadership') {
        return 'Management leaders';
      }
      if (section.key === 'team-at-work') return 'Gallery: Team at Work';
      if (section.key === 'events-and-offices') return 'Gallery: Events and Offices';
      if (section.type === 'gallery') {
        return (
          'Gallery: ' +
          ((section.heading && section.heading.trim()) || 'Photo set ' + (index + 1))
        );
      }
    }
    if (isSalesPurchase(pageType)) {
      if (section.key === 'what-we-sell') return 'Sales offerings';
      if (section.key === 'what-we-buy') return 'Purchase offerings';
      if (section.key === 'sales-gallery') return 'Gallery: Sales';
      if (section.key === 'purchase-gallery') return 'Gallery: Purchase';
      if (section.type === 'cards') {
        return (
          'Offerings: ' +
          ((section.heading && section.heading.trim()) || 'Card set ' + (index + 1))
        );
      }
      if (section.type === 'gallery') {
        return (
          'Gallery: ' +
          ((section.heading && section.heading.trim()) || 'Photo set ' + (index + 1))
        );
      }
    }
    if (isContactUs(pageType)) {
      if (section.key === 'contact-channels') return 'Contact details';
      if (section.key === 'our-offices') return 'Our offices';
      if (section.key === 'contact-gallery') return 'Gallery: Visit JD Gold';
      if (section.key === 'offices-gallery') return 'Gallery: Offices';
      if (section.type === 'cards') {
        return (
          'Cards: ' +
          ((section.heading && section.heading.trim()) || 'Card set ' + (index + 1))
        );
      }
      if (section.type === 'gallery') {
        return (
          'Gallery: ' +
          ((section.heading && section.heading.trim()) || 'Photo set ' + (index + 1))
        );
      }
    }
    return (
      (section.heading && section.heading.trim()) ||
      section.key ||
      'Section ' + (index + 1)
    );
  }

  function sectionHint(pageType, section) {
    if (isManagementGallery(pageType)) {
      if (section.key === 'leadership' || section.type === 'leadership') {
        return '<p class="hint">Portrait cards on /management. Role appears on the photo overlay. Independent of Home → Team management.</p>';
      }
      if (section.key === 'team-at-work') {
        return '<p class="hint">Equal photo grid. Use Add image for more photos.</p>';
      }
      if (section.key === 'events-and-offices') {
        return '<p class="hint">Mixed-size collage. The last two images become the wide bottom row.</p>';
      }
      if (section.type === 'gallery') {
        return '<p class="hint">Extra photo gallery on /management. A heading with Event or Office renders as a collage; otherwise an equal grid.</p>';
      }
    }
    if (isSalesPurchase(pageType)) {
      if (section.key === 'what-we-sell' || (section.type === 'cards' && /sell/i.test(section.heading || ''))) {
        return '<p class="hint">Product cards on /sales (What we sell). Title overlays the photo. Use Add card for more items.</p>';
      }
      if (section.key === 'what-we-buy' || (section.type === 'cards' && /buy|purchase/i.test(section.heading || ''))) {
        return '<p class="hint">Product cards on /sales (What we buy). Title overlays the photo. Use Add card for more items.</p>';
      }
      if (section.type === 'cards') {
        return '<p class="hint">Card row on /sales. Title overlays the photo.</p>';
      }
      if (section.key === 'sales-gallery') {
        return '<p class="hint">Equal photo grid on /sales. Use Add image for more photos.</p>';
      }
      if (section.key === 'purchase-gallery') {
        return '<p class="hint">Mixed-size collage on /sales. The last two images become the wide bottom row.</p>';
      }
      if (section.type === 'gallery') {
        return '<p class="hint">Extra photo gallery on /sales. A heading with Purchase or Buy renders as a collage; otherwise an equal grid.</p>';
      }
    }
    if (isContactUs(pageType)) {
      if (section.key === 'contact-channels') {
        return '<p class="hint">Phone, WhatsApp, email, website, and address on /contact. Description is the value shown. Optional Link URL makes the card clickable (tel:, mailto:, https:).</p>';
      }
      if (section.key === 'our-offices') {
        return '<p class="hint">Office cards on /contact. Title overlays the photo. Use Add card for more locations.</p>';
      }
      if (section.key === 'contact-gallery') {
        return '<p class="hint">Equal photo grid on /contact. Use Add image for more photos.</p>';
      }
      if (section.key === 'offices-gallery') {
        return '<p class="hint">Mixed-size collage on /contact. The last two images become the wide bottom row.</p>';
      }
      if (section.type === 'cards') {
        return '<p class="hint">Card row on /contact. Add an image for a photo card; leave image empty for a text contact card.</p>';
      }
      if (section.type === 'gallery') {
        return '<p class="hint">Extra photo gallery on /contact. A heading with Office renders as a collage; otherwise an equal grid.</p>';
      }
    }
    return '';
  }

  function emptyGallerySection(sortOrder) {
    return {
      key: 'gallery-' + Date.now(),
      type: 'gallery',
      sortOrder: sortOrder || 0,
      heading: 'NEW GALLERY',
      gallery: [],
    };
  }

  function renderSection(pageType, section, index) {
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
        renderCardList(prefix + '.cards', section.cards, cardImageCrop(pageType)) +
        '</div><button type="button" class="secondary" data-add-list="' +
        prefix +
        '.cards" data-kind="card">Add card</button>';
    } else if (section.type === 'gallery') {
      lists =
        '<div data-list="' +
        prefix +
        '.gallery">' +
        renderGallery(prefix + '.gallery', section.gallery, galleryCrop(pageType, section)) +
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
      sectionHeading(pageType, section, index),
      hiddenField(prefix + '.key', section.key || 'section-' + (index + 1)) +
        hiddenField(prefix + '.type', section.type || 'text') +
        hiddenField(prefix + '.sortOrder', String(section.sortOrder ?? index)) +
        sectionHint(pageType, section) +
        field('Section heading', prefix + '.heading', section.heading) +
        (!isCompactInnerPage(pageType)
          ? field('Section subheading', prefix + '.subheading', section.subheading) +
            field('Section description', prefix + '.description', section.description, {
              multiline: true,
            }) +
            field('Section image path / URL', prefix + '.image', section.image, {
              placeholder: '/images/… or https://…',
              crop: sectionImageCrop(pageType, section),
            }) +
            field('Section image alt', prefix + '.imageAlt', section.imageAlt)
          : '') +
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
    const isManagement = isManagementGallery(page.pageType);
    const isSales = isSalesPurchase(page.pageType);
    const isContact = isContactUs(page.pageType);
    const intro = isManagement
      ? '<p class="hint"><strong>Management Galleries</strong> is the CMS for <code>/management</code>. Edit the hero, management portraits, Team at Work grid, and Events and Offices collage here. Use <strong>Add photo gallery</strong> for extra photo sets. Home team portraits stay under Home page → Team management.</p>'
      : isSales
        ? '<p class="hint"><strong>Sales &amp; Purchase</strong> is the CMS for <code>/sales</code>. Edit the hero, What we sell / What we buy cards, Sales gallery, and Purchase collage here. Use <strong>Add photo gallery</strong> for extra photo sets.</p>'
        : isContact
          ? '<p class="hint"><strong>Contact Us</strong> is the CMS for <code>/contact</code>. Edit the hero, Get in Touch details, office cards, Visit gallery, and Offices collage here. Use <strong>Add photo gallery</strong> for extra photo sets. Home Get in Touch stays under Home page.</p>'
          : '';
    const heroTitle = isManagement || isSales || isContact ? 'Page hero (logo, title, image)' : 'Hero';
    return (
      intro +
      hiddenField('pageType', page.pageType || '') +
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
        heroTitle,
        field('Heading', 'hero.heading', hero.heading) +
          field('Subheading', 'hero.subheading', hero.subheading) +
          field('Description / tagline', 'hero.description', hero.description, {
            multiline: true,
          }) +
          field('Logo path / URL', 'hero.logoSrc', hero.logoSrc, {
            placeholder: '/images/… or https://…',
            crop: 'logo',
          }) +
          field('Hero image path / URL', 'hero.image', hero.image, {
            placeholder: '/images/… or https://…',
            crop: heroImageCrop(page.pageType),
          }) +
          field('Hero image alt', 'hero.imageAlt', hero.imageAlt) +
          field('Background image path / URL', 'hero.backgroundImage', hero.backgroundImage, {
            placeholder: '/images/… or https://…',
            crop: 'banner',
          }) +
          field('Brand tagline', 'hero.brandTagline', hero.brandTagline)
      ) +
      sections.map((section, index) => renderSection(page.pageType, section, index)).join('') +
      (isManagement || isSales || isContact
        ? '<p><button type="button" class="secondary" data-add-section="gallery">Add photo gallery</button></p>'
        : '')
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
      return { title: 'New card', subtitle: '', description: '', image: '', imageAlt: '', link: '' };
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

    (next.sections || []).forEach((section, index) => {
      if (typeof section.sortOrder === 'string') {
        const parsed = Number(section.sortOrder);
        section.sortOrder = Number.isFinite(parsed) ? parsed : index;
      }
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
    const hint = document.getElementById('pageEditorHint');
    if (!root) return;
    if (hint) {
      if (page && isManagementGallery(page.pageType)) {
        hint.innerHTML =
          '<strong>Management Galleries</strong> is the CMS for <code>/management</code>. Hero, portraits, Team at Work, Events and Offices, and extra photo galleries all save here. Home team portraits stay under Home page → Team management.';
      } else if (page && isSalesPurchase(page.pageType)) {
        hint.innerHTML =
          '<strong>Sales &amp; Purchase</strong> is the CMS for <code>/sales</code>. Hero, What we sell, What we buy, Sales gallery, Purchase collage, and extra photo galleries all save here.';
      } else if (page && isContactUs(page.pageType)) {
        hint.innerHTML =
          '<strong>Contact Us</strong> is the CMS for <code>/contact</code>. Hero, Get in Touch, offices, Visit gallery, Offices collage, and extra photo galleries all save here. Home Get in Touch stays under Home page.';
      } else {
        hint.innerHTML =
          'Edit the selected page with the same fields shown on the website. Each image field lists its website frame. Use <strong>Upload &amp; crop</strong> to preview how the photo will display before saving.';
      }
    }
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
      const addSectionBtn = event.target.closest('[data-add-section]');
      const addBtn = event.target.closest('[data-add-list]');
      const removeBtn = event.target.closest('[data-remove-item]');
      if (!addSectionBtn && !addBtn && !removeBtn) return;
      const json = document.getElementById('pageJson');
      const current = JSON.parse(json.value || '{}');
      const draft = collectInnerPageForm(current);
      if (addSectionBtn) {
        if (!Array.isArray(draft.sections)) draft.sections = [];
        if (addSectionBtn.getAttribute('data-add-section') === 'gallery') {
          draft.sections.push(emptyGallerySection(draft.sections.length));
        }
      }
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
