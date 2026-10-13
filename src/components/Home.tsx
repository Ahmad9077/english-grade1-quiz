import { Art } from '../art/Art'
import { TOPICS, type TopicId } from '../data/catalog'
import { toneStyle } from '../data/tones'
import { arabicNumber } from '../domain/format'
import type { SavedProgress } from '../domain/progress'
import { TEST_PER_TOPIC } from '../domain/round'
import { HUB_URL } from '../hub/bootstrap'
import { LetterBlocks } from './Splash'
import { PreviewBadge, SoundToggle, Stars, order } from './ui'

interface HomeProps {
  progress: SavedProgress
  muted: boolean
  onToggleSound: () => void
  onOpenTopic: (topic: TopicId) => void
  onStartTest: () => void
}

export function Home({ progress, muted, onToggleSound, onOpenTopic, onStartTest }: HomeProps) {
  const testCount = TOPICS.length * TEST_PER_TOPIC

  return (
    <main className="screen home">
      <header className="top-bar">
        <div className="brand">
          <LetterBlocks className="brand-mark" />
          <span className="brand-word" dir="ltr">English</span>
          <PreviewBadge />
        </div>
        <SoundToggle muted={muted} onToggle={onToggleSound} />
      </header>

      <section className="home-body">
        <button type="button" className="test-banner press rise" style={{ ...toneStyle('test'), ...order(0) }} onClick={onStartTest}>
          <span className="test-banner-art" aria-hidden="true">
            <Art art="🏆" />
          </span>
          <span className="test-banner-text">
            <span className="test-banner-title">الاختبار التجريبي</span>
            <span className="test-banner-sub">{arabicNumber(testCount)} سؤالا من كل الدروس</span>
            <Stars count={progress.stars.test ?? 0} size="sm" />
          </span>
        </button>

        <h2 className="section-title rise" style={order(1)}>
          الدروس
        </h2>

        <div className="topic-grid">
          {TOPICS.map((topic, index) => (
            <button
              key={topic.id}
              type="button"
              className="topic-card press rise"
              style={{ ...toneStyle(topic.id), ...order(index + 2) }}
              onClick={() => onOpenTopic(topic.id)}
              data-topic={topic.id}
            >
              <span className="topic-card-art" aria-hidden="true">
                <Art art={topic.art[0] ?? ''} className="art-back" />
                <Art art={topic.art[1] ?? ''} className="art-front" />
              </span>
              <span className="topic-card-title">{topic.title}</span>
              <span className="topic-card-foot">
                <Stars count={progress.stars[topic.id] ?? 0} size="sm" />
                {progress.learned.includes(topic.id) ? <span className="learned-chip">تعلمت ✓</span> : null}
              </span>
            </button>
          ))}
        </div>

        {__QUIZ_BUILD_MODE__ === 'production-hub' ? (
          <a className="hub-link" href={HUB_URL}>
            العودة إلى صفحة الاختبارات
          </a>
        ) : (
          <p className="preview-note">نسخة تجريبية للمعاينة: النجوم تحفظ على هذا الجهاز فقط، ولا ترسل أي نتائج إلى الـ Hub.</p>
        )}
      </section>
    </main>
  )
}
