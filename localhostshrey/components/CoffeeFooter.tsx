"use client";

import { useEffect, useRef, useState } from "react";

/*
 * A small surprise at the bottom of the page: a guy taking a coffee break.
 * An original flat illustration drawn as inline SVG (warm dark café, one amber light, curly ink hair, a cream tank top),
 * animated with CSS. No images, no canvas, no gradients; the light is stepped translucent shapes.
 */
const C = {
  wall: "#211a15",
  floor: "#15110e",
  glass: "#f8e4b4",
  amber: "#f2c879",
  frame: "#6a4e36",
  leaf: "#2f4b30",
  leaf2: "#3d5e39",
  wood: "#4b3626",
  skin: "#b9774f",
  skinShade: "#9a5d3a",
  hair: "#1d1511",
  tank: "#ece4d4",
  tankShade: "#cdc2ad",
  table: "#d6b88c",
  tableEdge: "#a88358",
  cup: "#f4efe6",
  sleeve: "#c28b52",
};

const CURLS: [number, number, number][] = [
  [442.4, 189.8, 24.9],
  [437.9, 174.6, 26.5],
  [439.9, 159.0, 26.4],
  [451.3, 147.1, 22.7],
  [454.1, 130.3, 24.2],
  [467.6, 120.5, 19.9],
  [484.2, 117.8, 21.0],
  [500.0, 115.1, 23.6],
  [514.7, 121.5, 20.7],
  [529.5, 125.1, 26.3],
  [544.7, 131.4, 20.3],
  [554.8, 144.0, 20.1],
  [559.0, 159.2, 20.0],
  [555.0, 174.3, 26.0],
  [554.1, 188.7, 20.7],
];
const INNER: [number, number, number][] = [
  [542.5, 128.9, 21.7],
  [540.6, 115.6, 24.1],
  [474.0, 131.6, 24.1],
  [541.1, 129.7, 21.8],
  [487.8, 100.6, 20.9],
  [461.7, 106.1, 23.6],
  [456.3, 121.1, 22.0],
  [483.3, 126.7, 22.9],
  [483.8, 113.2, 24.2],
];
const FRINGE: [number, number, number][] = [
  [457.3, 138.7, 11.1],
  [471.5, 135.8, 11.1],
  [481.7, 129.0, 13.3],
  [487.1, 124.0, 11.7],
  [502.7, 124.2, 14.0],
  [512.6, 133.9, 12.4],
  [519.1, 130.8, 14.1],
  [527.6, 134.7, 14.2],
  [542.2, 128.4, 14.8],
];

const Leaves = ({
  x,
  y,
  n,
  len,
  seed,
}: {
  x: number;
  y: number;
  n: number;
  len: number;
  seed: number;
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const a = -70 + (140 * i) / (n - 1) + ((i * 37 + seed * 13) % 17) - 8; // degrees away from straight down
      const l = len * (0.62 + ((i * 53 + seed * 7) % 38) / 100);
      return (
        <ellipse
          key={i}
          cx={x}
          cy={y + l / 2}
          rx={7 + (i % 3) * 1.5}
          ry={l / 2}
          transform={`rotate(${a} ${x} ${y})`}
          fill={i % 2 ? C.leaf : C.leaf2}
        />
      );
    })}
  </g>
);

export default function CoffeeFooter() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  // on a phone the frame is nearly square, so frame the scene wider around him instead of cropping in
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 560px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const host = frame.current;
    if (!host) return;
    let revealed = false;
    // reveal once the frame is a little way into view, then keep it; pause the loops while it is off screen
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) delete host.dataset.paused;
        else host.dataset.paused = "";
        if (e.isIntersecting && !revealed && e.intersectionRatio >= 0.14) {
          revealed = true;
          host.dataset.in = "";
        }
      },
      { threshold: [0, 0.14, 0.4] },
    );
    host.dataset.paused = "";
    io.observe(host);
    return () => io.disconnect();
  }, []);

  // tap him and he takes a sip right now
  const sip = () => {
    const host = frame.current;
    if (!host || !("in" in host.dataset)) return;
    host.dataset.sip = host.dataset.sip === "b" ? "a" : "b";
  };

  return (
    <footer className="cafe" ref={root}>
      <div className="cafe__frame" ref={frame} onPointerDown={sip}>
        <svg
          className="cafe__svg"
          viewBox={narrow ? "275 -24 450 500" : "0 24 1000 372"}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="An illustration of a guy with curly hair sitting at a café table, sipping a coffee in the sunlight."
        >
          <defs>
            <filter id="cafe-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <filter id="cafe-haze" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="30" />
            </filter>
            <filter
              id="cafe-haze-s"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>

          {/* the café behind him */}
          <rect width="1000" height="460" fill={C.floor} />
          <rect width="1000" height="334" fill={C.wall} />

          {/* big window on the right, its light spilling into the room */}
          <g className="cafe__fade" style={{ ["--d" as string]: "0.2s" }}>
            <ellipse
              cx="760"
              cy="150"
              rx="270"
              ry="220"
              fill={C.amber}
              opacity="0.2"
              filter="url(#cafe-haze)"
            />
            <ellipse
              cx="760"
              cy="150"
              rx="150"
              ry="140"
              fill={C.amber}
              opacity="0.3"
              filter="url(#cafe-haze-s)"
            />
          </g>
          <g>
            <rect
              x="660"
              y="34"
              width="230"
              height="226"
              fill={C.glass}
              opacity="0.95"
            />
            <g stroke={C.frame} strokeWidth="5">
              <path d="M660 34h230v226H660z" fill="none" />
              <path d="M736.7 34v226M813.3 34v226M660 109.3h230M660 184.7h230" />
            </g>
          </g>

          {/* hanging plants and chairs */}
          <g className="cafe__plant" style={{ transformOrigin: "205px 0px" }}>
            <path d="M205 0v62" stroke={C.wood} strokeWidth="2" />
            <ellipse cx="205" cy="70" rx="20" ry="9" fill={C.wood} />
            <Leaves x={205} y={74} n={9} len={96} seed={1} />
          </g>
          <g
            className="cafe__plant cafe__plant--b"
            style={{ transformOrigin: "360px 0px" }}
          >
            <path d="M360 0v40" stroke={C.wood} strokeWidth="2" />
            <ellipse cx="360" cy="47" rx="16" ry="7" fill={C.wood} />
            <Leaves x={360} y={51} n={7} len={70} seed={4} />
          </g>
          <g
            className="cafe__plant cafe__plant--c"
            style={{ transformOrigin: "612px 0px" }}
          >
            <path d="M612 0v48" stroke={C.wood} strokeWidth="2" />
            <ellipse cx="612" cy="55" rx="17" ry="7.5" fill={C.wood} />
            <Leaves x={612} y={59} n={7} len={80} seed={9} />
          </g>
          <g
            stroke={C.wood}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          >
            <circle cx="120" cy="258" r="34" />
            <path d="M92 296h56M100 296l-10 38M140 296l10 38" />
            <circle cx="262" cy="272" r="28" opacity="0.7" />
            <path d="M240 304h44M246 304l-8 30M278 304l8 30" opacity="0.7" />
          </g>
          {/* someone moving about at the counter, out of focus */}
          <g filter="url(#cafe-blur)" opacity="0.5" fill="#0b0806">
            <circle cx="60" cy="196" r="19" />
            <path d="M24 336c-4-60 6-112 36-112s40 52 36 112z" />
          </g>

          {/* shafts of light across the room */}
          <g className="cafe__shafts" style={{ ["--d" as string]: "0.7s" }}>
            <polygon
              className="cafe__shaft"
              points="660,50 740,50 430,440 300,440"
              fill={C.amber}
              fillOpacity="0.1"
            />
            <polygon
              className="cafe__shaft cafe__shaft--b"
              points="750,50 830,50 660,440 540,440"
              fill={C.amber}
              fillOpacity="0.07"
            />
          </g>

          {/* him */}
          <g transform="translate(500 340) scale(1.16) translate(-500 -340)">
            <g className="cafe__char">
              <g className="cafe__breath">
                {/* tank top and chest */}
                <path
                  d="M398 346L402 304Q408 262 470 250L530 250Q592 262 598 304L602 346Z"
                  fill={C.tank}
                />
                <path
                  d="M402 304Q408 262 470 250L476 270Q430 276 424 322L424 346L398 346Z"
                  fill={C.tankShade}
                  opacity="0.55"
                />
                <path d="M470 250Q500 304 530 250Z" fill={C.skin} />
                <path
                  d="M470 250Q500 304 530 250Q500 268 470 250Z"
                  fill={C.skinShade}
                  opacity="0.5"
                />
                {/* neck */}
                <path d="M476 214h48v42q-24 22-48 0z" fill={C.skin} />
                <ellipse
                  cx="500"
                  cy="238"
                  rx="30"
                  ry="13"
                  fill={C.skinShade}
                  opacity="0.55"
                />

                <g className="cafe__head">
                  {/* ears, head */}
                  <circle cx="446" cy="190" r="11" fill={C.skinShade} />
                  <circle cx="554" cy="190" r="11" fill={C.skinShade} />
                  <ellipse cx="500" cy="178" rx="54" ry="62" fill={C.skin} />
                  <ellipse
                    cx="528"
                    cy="190"
                    rx="26"
                    ry="46"
                    fill={C.skinShade}
                    opacity="0.28"
                  />
                  {/* hair: a cap of curls, a few strays, a fringe */}
                  <g fill={C.hair}>
                    <ellipse cx="500" cy="132" rx="58" ry="38" />
                    {INNER.map(([x, y, r], i) => (
                      <circle key={`i${i}`} cx={x} cy={y} r={r} />
                    ))}
                    {CURLS.map(([x, y, r], i) => (
                      <circle key={`c${i}`} cx={x} cy={y} r={r} />
                    ))}
                    {FRINGE.map(([x, y, r], i) => (
                      <circle key={`f${i}`} cx={x} cy={y} r={r} />
                    ))}
                  </g>
                  {/* sunlight catching the curls on the window side */}
                  <g
                    fill="none"
                    stroke={C.amber}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    opacity="0.6"
                  >
                    <path d="M548 116q16 14 20 38" />
                    <path d="M524 100q18 2 30 16" />
                  </g>
                  {/* face */}
                  <g fill="none" stroke={C.hair} strokeLinecap="round">
                    <path
                      d="M466 164q12-7 24-1M510 163q12-6 24 1"
                      strokeWidth="4.5"
                    />
                  </g>
                  <g className="cafe__eyes-open" fill={C.hair}>
                    <g className="cafe__blink">
                      <ellipse cx="478" cy="182" rx="4.2" ry="5.6" />
                      <ellipse cx="522" cy="182" rx="4.2" ry="5.6" />
                    </g>
                  </g>
                  <g
                    className="cafe__eyes-closed"
                    fill="none"
                    stroke={C.hair}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  >
                    <path d="M470 182q8 6 16 0M514 182q8 6 16 0" />
                  </g>
                  <path
                    d="M498 188q-5 13 5 15"
                    stroke={C.skinShade}
                    strokeWidth="3.4"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    className="cafe__mouth"
                    d="M487 212q13 8 26 0"
                    stroke="#7a3f2a"
                    strokeWidth="3.4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
              </g>
            </g>
          </g>

          {/* the table */}
          <rect x="40" y="334" width="920" height="15" rx="3" fill={C.table} />
          <rect
            x="40"
            y="334"
            width="920"
            height="3.5"
            rx="1.5"
            fill="#ecd3a7"
            opacity="0.8"
          />
          <rect x="40" y="349" width="920" height="15" fill={C.tableEdge} />
          <rect x="40" y="364" width="920" height="96" fill={C.floor} />
          <rect
            x="40"
            y="364"
            width="920"
            height="12"
            fill="#000"
            opacity="0.45"
          />

          {/* his second cup, waiting on the table, with the steam */}
          <g transform="translate(-82 0)">
            <ellipse cx="318" cy="335" rx="36" ry="5" fill="#cdbfa6" />
            <path d="M300 304h36l-4 28q-14 5-28 0z" fill="#efe7d8" />
            <path
              d="M336 310q14 0 14 10t-13 10"
              stroke="#efe7d8"
              strokeWidth="4"
              fill="none"
            />
            <ellipse cx="318" cy="304" rx="18" ry="4" fill="#dcd2bf" />
            <ellipse cx="318" cy="304.5" rx="15" ry="2.6" fill="#5a3b26" />
            <g
              className="cafe__steam"
              fill="none"
              stroke="#f4efe6"
              strokeWidth="3.2"
              strokeLinecap="round"
            >
              <path d="M311 292q-8-10 0-20t-2-20" />
              <path
                d="M325 292q8-10 0-20t2-20"
                style={{ animationDelay: "-1.9s" }}
              />
            </g>
          </g>

          {/* arms, hands and the cup (these rise to his mouth on every sip) */}
          <g transform="translate(500 340) scale(1.16) translate(-500 -340)">
            <g className="cafe__char cafe__char--arms">
              <g className="cafe__breath">
                <g
                  stroke={C.skin}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M410 292L420 340L480 240" strokeWidth="34" />
                  <path d="M590 292L580 340L520 240" strokeWidth="34" />
                </g>
                <g
                  stroke={C.skinShade}
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.4"
                >
                  <path d="M590 300L580 344" strokeWidth="10" />
                  <path d="M584 318L548 288" strokeWidth="8" />
                </g>
                <g className="cafe__sip">
                  {/* cup: a paper cup with a sleeve */}
                  <path d="M469 206h62l-7 52q-24 8-48 0z" fill={C.cup} />
                  <path d="M472 228h56l-3 21h-50z" fill={C.sleeve} />
                  <path
                    d="M478 238h44"
                    stroke="#fff"
                    strokeWidth="2.6"
                    opacity="0.5"
                    strokeLinecap="round"
                  />
                  <ellipse cx="500" cy="206" rx="31" ry="6" fill="#e3dccf" />
                  <ellipse cx="500" cy="205" rx="26" ry="3.8" fill="#5a3b26" />
                  {/* both hands around it */}
                  <g>
                    <ellipse cx="472" cy="238" rx="16" ry="19" fill={C.skin} />
                    <ellipse cx="528" cy="238" rx="16" ry="19" fill={C.skin} />
                    <path
                      d="M478 224q7 8 4 18M522 224q-7 8-4 18"
                      stroke={C.skinShade}
                      strokeWidth="2.6"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M459 242q9 8 22 6M541 242q-9 8-22 6"
                      stroke={C.skinShade}
                      strokeWidth="2.4"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                    <path
                      d="M462 232q3-5 8-6M538 232q-3-5-8-6"
                      stroke={C.skinShade}
                      strokeWidth="2.2"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </g>
                </g>
              </g>
            </g>
          </g>

          {/* a last, faint wash of light over everything */}
          <polygon
            className="cafe__shaft"
            points="690,60 740,60 560,440 470,440"
            fill={C.amber}
            fillOpacity="0.045"
          />
        </svg>
        <span className="cafe__rim" aria-hidden="true" />
      </div>
    </footer>
  );
}
