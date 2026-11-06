import React, { useEffect, useMemo, useState } from "react";
import SpotifyCard from "./components/SpotifyCard";
import { useSpotify } from "./hooks/useSpotify";

const DEFAULT_DATE = "2023-02-22";
const messages = [
  "You don't have to solve forever today. Just take care of today.",
  "A craving is a feeling, not an instruction. It will pass.",
  "Progress is built one ordinary day at a time.",
  "You can be proud of your progress without needing to be perfect.",
  "Make the next choice a kind one for your future self."
];

const milestones = [
  { days: 30, label: "30 days", note: "One month of showing up." },
  { days: 100, label: "100 days", note: "A hundred days of choices aligned with your goal." },
  { days: 182, label: "6 months", note: "Half a year. Keep going at your own pace." },
  { days: 365, label: "1 year", note: "A full year of progress." },
  { days: 1095, label: "3 years", note: "Three years of choosing your path." },
  { days: 1461, label: "4 years", note: "Four years of showing up for yourself." },
  { days: 1826, label: "5 years", note: "Five years, one day at a time." },
  { days: 3652, label: "10 years", note: "A decade of commitment." }
];

function getDuration(start, now) {
  const diff = Math.max(0, now.getTime() - start.getTime());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  return {
    days,
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalHours: Math.floor(totalSeconds / 3600),
    totalSeconds,
    yearsCompleted: Math.floor(days / 365)
  };
}

function addCalendarMonths(date, months) {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

function calendarDuration(start, now) {
  let years = now.getFullYear() - start.getFullYear();
  let cursor = new Date(start);
  cursor.setFullYear(cursor.getFullYear() + years);
  if (cursor > now) {
    years -= 1;
    cursor = new Date(start);
    cursor.setFullYear(cursor.getFullYear() + years);
  }
  let months = 0;
  while (months < 11) {
    const next = addCalendarMonths(cursor, 1);
    if (next > now) break;
    cursor = next;
    months += 1;
  }
  const days = Math.floor((now - cursor) / 86400000);
  return { years, months, days };
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default function App() {
  const [startDate, setStartDate] = useState(() => localStorage.getItem("sobrietyStartDate") || DEFAULT_DATE);
  const [now, setNow] = useState(new Date());
  const [why, setWhy] = useState(() => localStorage.getItem("sobrietyWhy") || "");
  const [journal, setJournal] = useState(() => localStorage.getItem("sobrietyJournal") || "");
  const [activeTab, setActiveTab] = useState("today");
  const [messageIndex, setMessageIndex] = useState(() => new Date().getDate() % messages.length);
  const spotify = useSpotify();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => localStorage.setItem("sobrietyStartDate", startDate), [startDate]);
  useEffect(() => localStorage.setItem("sobrietyWhy", why), [why]);
  useEffect(() => localStorage.setItem("sobrietyJournal", journal), [journal]);

  const start = useMemo(() => {
    const [y, m, d] = startDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [startDate]);

  const validDate = startDate && !Number.isNaN(start.getTime()) && start <= now;
  const duration = validDate ? getDuration(start, now) : null;
  const calendar = validDate ? calendarDuration(start, now) : null;
  const nextMilestone = validDate ? milestones.find(item => item.days > duration.days) : null;
  const progress = nextMilestone ? Math.min(100, (duration.days / nextMilestone.days) * 100) : 100;

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="One Day at a Time home">
          <span className="brand-mark">✳</span>
          <span>one day at a time</span>
        </a>
        <span className="top-note">YOUR JOURNEY, YOUR PACE</span>
      </header>

      <section className="hero" id="home">
        <div className="eyebrow"><span className="live-dot" /> YOUR SOBRIETY JOURNEY</div>
        <h1>Every day<br /><em>counts.</em></h1>
        <p className="hero-copy">A personal dashboard for checking in: your counter, your music, your reason, and the next milestone.</p>
      </section>

      <nav className="tabs" aria-label="Main navigation">
        <button className={activeTab === "today" ? "tab active" : "tab"} onClick={() => setActiveTab("today")}>My counter</button>
        <button className={activeTab === "toolkit" ? "tab active" : "tab"} onClick={() => setActiveTab("toolkit")}>Quit toolkit</button>
        <button className={activeTab === "journal" ? "tab active" : "tab"} onClick={() => setActiveTab("journal")}>My notes</button>
      </nav>

      {activeTab === "today" && (
        <section className="dashboard">
          <div className="content-grid">
            <div className="counter-card">
              <div className="card-topline">
                <span className="card-label">TIME ALCOHOL-FREE</span>
                <span className="status-pill"><span className="live-dot" /> LIVE COUNTER</span>
              </div>
              {!validDate ? (
                <div className="date-error">Choose a valid start date that is today or earlier.</div>
              ) : (
                <>
                  <div className="since-pill">Alcohol-free since {formatDate(start)}</div>
                  <div className="calendar-headline">
                    {calendar.years} years, {calendar.months} months, {calendar.days} days
                  </div>
                  <div className="as-of">As of {formatDate(now)} · ticking live</div>
                  <div className="stat-row">
                    <div><strong>{duration.days.toLocaleString()}</strong><small>Days</small></div>
                    <div><strong>{duration.totalHours.toLocaleString()}</strong><small>Hours</small></div>
                    <div><strong>{calendar.years}</strong><small>Years completed</small></div>
                  </div>
                  <div className="ticker">
                    {[["HOURS", duration.hours], ["MINUTES", duration.minutes], ["SECONDS", duration.seconds]].map(([label, value]) => (
                      <div className="ticker-unit" key={label}>
                        <strong>{String(value).padStart(2, "0")}</strong>
                        <small>{label}</small>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="date-control">
                <label htmlFor="start-date">MY START DATE</label>
                <input id="start-date" type="date" value={startDate} max={now.toISOString().slice(0, 10)} onChange={e => setStartDate(e.target.value)} />
              </div>
            </div>

            <aside className="side-column">
              <div className="quote-card">
                <div className="section-kicker">TODAY'S MESSAGE</div>
                <div className="quote-symbol">“</div>
                <p>{messages[messageIndex]}</p>
                <button className="text-button" onClick={() => setMessageIndex((messageIndex + 1) % messages.length)}>Another reminder ↗</button>
              </div>
              <div className="milestone-card">
                <div className="section-kicker">UP NEXT</div>
                {nextMilestone ? (
                  <>
                    <h2>{nextMilestone.label}</h2>
                    <p>{nextMilestone.note}</p>
                    <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
                    <div className="progress-caption">{Math.max(0, nextMilestone.days - duration.days)} days to go</div>
                  </>
                ) : (
                  <><h2>Look how far you've come.</h2><p>You've passed every milestone on this list. Keep choosing what works for you.</p></>
                )}
              </div>
            </aside>
          </div>

          <div className="motivation-card">
            <div className="section-kicker">WHY I QUIT</div>
            <textarea
              value={why}
              onChange={e => setWhy(e.target.value)}
              placeholder="Your personal motivation — health, family, energy, self-respect, or anything that keeps you going."
              rows="3"
            />
            <div className="saved-indicator"><span className="live-dot" /> Saved on this device</div>
          </div>

          <SpotifyCard spotify={spotify} />
        </section>
      )}

      {activeTab === "toolkit" && (
        <section className="toolkit-section">
          <div className="section-heading">
            <div className="section-kicker">A TOOLBOX FOR TOUGH MOMENTS</div>
            <h2>You can get through<br />the next few minutes.</h2>
            <p>Try one small action. You don't need to figure everything out at once.</p>
          </div>
          <div className="tool-grid">
            <article className="tool-card"><span className="tool-number">01</span><h3>Change the scene</h3><p>Step outside, take a short walk, shower, or move to a different room. Interrupt the routine that is connected to the craving.</p></article>
            <article className="tool-card"><span className="tool-number">02</span><h3>Buy yourself time</h3><p>Set a 10-minute timer. Drink water, eat something, breathe slowly, and remind yourself that urges can rise and fall.</p></article>
            <article className="tool-card"><span className="tool-number">03</span><h3>Reach out</h3><p>Text someone you trust: “I'm having an urge. Can you talk with me for a few minutes?” You don't have to do this alone.</p></article>
            <article className="tool-card"><span className="tool-number">04</span><h3>Plan for pressure</h3><p>Keep a simple response ready: “No thanks, I'm not drinking.” Bring a non-alcoholic drink and make an exit plan.</p></article>
          </div>
          <div className="support-note"><strong>A note about safety</strong><p>If you drink heavily or regularly, stopping suddenly can cause dangerous withdrawal. Speak with a healthcare professional before stopping. Severe shaking, confusion, hallucinations, or seizures need urgent medical care.</p><p>For confidential support in the U.S., SAMHSA's helpline is <a href="tel:18006624357">1-800-662-HELP (4357)</a>.</p></div>
        </section>
      )}

      {activeTab === "journal" && (
        <section className="journal-section">
          <div className="section-heading">
            <div className="section-kicker">A SPACE THAT'S JUST YOURS</div>
            <h2>Remember your<br />reason.</h2>
            <p>Your notes are saved only in this browser on this device.</p>
          </div>
          <label className="field-label" htmlFor="why">WHY I CHOSE THIS</label>
          <textarea id="why" value={why} onChange={e => setWhy(e.target.value)} placeholder="What made you want to stop drinking? What do you want more of in your life?" rows="4" />
          <label className="field-label" htmlFor="journal">A NOTE TO MYSELF</label>
          <textarea id="journal" value={journal} onChange={e => setJournal(e.target.value)} placeholder="Write about today, a difficult moment, a win, or anything you want to remember..." rows="7" />
          <div className="saved-indicator"><span className="live-dot" /> Saved automatically on this device</div>
        </section>
      )}

      <footer className="footer">
        <div className="footer-mark">✳</div>
        <p><strong>One day at a time.</strong><br />No judgment. No perfection. Just progress.</p>
        <span className="footer-small">A personal tracker, not medical care.</span>
      </footer>
    </main>
  );
}
