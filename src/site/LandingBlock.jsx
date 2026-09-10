// Render jedného bloku úvodnej stránky (VIEW). Typy:
//   text     — nadpis / podnadpis / odsek
//   carousel — carusel vizualizácií (lightbox + stiahnutie)
//   button   — banner tlačidlo na spustenie prehliadky
//   cards    — karty bytov
//   variants — sekcia variantov: prepínač + obrázky + popis vybraného variantu

import { useEffect, useState } from 'react';
import Carousel from './Carousel.jsx';

export default function LandingBlock({ block, defaultTourSrc, onOpenTour }) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />;
    case 'carousel':
      return block.slides.length ? (
        <section className="lblk lblk--carousel">
          <Carousel slides={block.slides} />
        </section>
      ) : null;
    case 'button':
      return <ButtonBlock block={block} defaultTourSrc={defaultTourSrc} onOpenTour={onOpenTour} />;
    case 'cards':
      return <CardsBlock block={block} onOpenTour={onOpenTour} />;
    case 'variants':
      return <VariantsBlock block={block} />;
    case 'docs':
      return <DocsBlock block={block} />;
    default:
      return null;
  }
}

function TextBlock({ block }) {
  if (!block.text) return null;
  const Tag = block.style === 'heading' ? 'h2' : block.style === 'subheading' ? 'h3' : 'p';
  return (
    <section className="lblk lblk--text">
      <Tag
        className={`lblk-text lblk-text--${block.style}`}
        style={{ textAlign: block.align, ...(block.color ? { color: block.color } : {}) }}
      >
        {block.text}
      </Tag>
    </section>
  );
}

function ButtonBlock({ block, defaultTourSrc, onOpenTour }) {
  if (!block.label) return null;
  const tour = block.tourSrc || defaultTourSrc;
  return (
    <section className="lblk lblk--button">
      <div className="landing__hero-cta-wrap">
        <button
          type="button"
          className={`landing__hero-cta ${block.image ? 'has-img' : ''}`}
          style={block.image ? { backgroundImage: `url(${block.image})` } : undefined}
          onClick={() => onOpenTour(tour)}
        >
          <span>{block.label}</span>
        </button>
      </div>
    </section>
  );
}

function CardsBlock({ block, onOpenTour }) {
  const bg = (img) => (img ? { backgroundImage: `url(${img})` } : undefined);
  return (
    <section className="lblk lblk--cards landing__byty">
      {block.title && (
        <h2 className="landing__byty-title" style={block.titleColor ? { color: block.titleColor } : undefined}>
          {block.title}
        </h2>
      )}
      <div className="landing__cards">
        {block.items.map((a) => {
          const clickable = Boolean(a.tourSrc);
          return (
            <article
              key={a.id}
              className={`apt-card ${clickable ? 'is-clickable' : 'is-soon'}`}
              onClick={clickable ? () => onOpenTour(a.tourSrc) : undefined}
            >
              <div className="apt-card__img" style={bg(a.image)}>
                {!a.image && <span className="apt-card__img-ph">{a.title}</span>}
              </div>
              <div className="apt-card__body">
                <h3 className="apt-card__title">{a.title}</h3>
                {a.meta && <p className="apt-card__meta">{a.meta}</p>}
                {clickable ? (
                  <span className="apt-card__action">Spustiť prehliadku →</span>
                ) : (
                  <span className="apt-card__soon">Pripravujeme</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DocsBlock({ block }) {
  const [preview, setPreview] = useState(null); // otvorený dokument (náhľad) alebo null
  const items = (block.items || []).filter((d) => d.file || d.label);

  // Esc zavrie náhľad
  useEffect(() => {
    if (!preview) return undefined;
    const onKey = (e) => e.key === 'Escape' && setPreview(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  if (items.length === 0 && !block.title) return null;

  return (
    <section className="lblk lblk--docs">
      {block.title && (
        <h2 className="landing__byty-title" style={block.titleColor ? { color: block.titleColor } : undefined}>
          {block.title}
        </h2>
      )}
      <div className="ldocs">
        {items.map((d) => (
          <div className={`ldoc ${d.image ? 'has-thumb' : ''}`} key={d.id}>
            {d.image ? (
              <span
                className={`ldoc__thumb ${d.file ? 'is-clickable' : ''}`}
                style={{ backgroundImage: `url(${d.image})` }}
                onClick={d.file ? () => setPreview(d) : undefined}
                title={d.file ? 'Otvoriť náhľad' : undefined}
              />
            ) : (
              <span className="ldoc__icon" aria-hidden="true">PDF</span>
            )}
            <span className="ldoc__label">{d.label || 'Dokument'}</span>
            {d.file && (
              <div className="ldoc__actions">
                <button type="button" className="ldoc__btn" onClick={() => setPreview(d)}>Náhľad</button>
                <a className="ldoc__btn ldoc__btn--ghost" href={d.file} download>Stiahnuť</a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Náhľad PDF (natívny PDF viewer prehliadača; object + embed fallback) */}
      {preview && (
        <div className="ldoc-modal" onClick={() => setPreview(null)}>
          <div className="ldoc-modal__bar" onClick={(e) => e.stopPropagation()}>
            <span className="ldoc-modal__title">{preview.label}</span>
            <div className="ldoc-modal__actions">
              <a className="lb__btn" href={preview.file} target="_blank" rel="noreferrer">Otvoriť v novom okne</a>
              <a className="lb__btn" href={preview.file} download>⬇ Stiahnuť</a>
              <button type="button" className="lb__btn lb__btn--close" onClick={() => setPreview(null)} aria-label="Zavrieť">✕</button>
            </div>
          </div>
          <object className="ldoc-modal__frame" data={preview.file} type="application/pdf" onClick={(e) => e.stopPropagation()}>
            <embed className="ldoc-modal__frame" src={preview.file} type="application/pdf" />
            <div className="ldoc-modal__fallback">
              <p>Tento prehliadač nevie zobraziť PDF priamo v okne.</p>
              <a className="lb__btn" href={preview.file} target="_blank" rel="noreferrer">Otvoriť PDF v novom okne</a>
            </div>
          </object>
        </div>
      )}
    </section>
  );
}

function VariantsBlock({ block }) {
  const [active, setActive] = useState(0);
  const options = block.options || [];
  if (options.length === 0) return null;
  const idx = Math.min(active, options.length - 1);
  const opt = options[idx];
  return (
    <section className="lblk lblk--variants">
      {options.length > 1 && (
        <div className="lvar__switch">
          {options.map((o, k) => (
            <button
              key={o.id}
              type="button"
              className={`lvar__btn ${k === idx ? 'is-active' : ''}`}
              onClick={() => setActive(k)}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
      {opt.slides.length > 0 && <Carousel key={opt.id} slides={opt.slides} />}
      {opt.text && <p className="lvar__desc">{opt.text}</p>}
    </section>
  );
}
