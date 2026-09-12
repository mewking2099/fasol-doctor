// Audio key → file path map matches audio-clips.csv exactly
const BASE = '/audio'

const AUDIO_MAP: Record<string, string> = {
  'nav.back':              `${BASE}/ui/nav_back.mp3`,
  'common.wait':           `${BASE}/ui/common_wait.mp3`,
  'common.offline':        `${BASE}/ui/common_offline.mp3`,
  'common.listen_all':     `${BASE}/ui/common_listen_all.mp3`,
  'common.listen_full':    `${BASE}/ui/common_listen_full.mp3`,
  'common.save_report':    `${BASE}/ui/common_save_report.mp3`,
  'home.b1':               `${BASE}/ui/home_b1.mp3`,
  'home.b2':               `${BASE}/ui/home_b2.mp3`,
  'home.b3':               `${BASE}/ui/home_b3.mp3`,
  'home.b4':               `${BASE}/ui/home_b4.mp3`,
  'home.weekly_tip':       `${BASE}/ui/home_weekly_tip.mp3`,
  'q.crop':                `${BASE}/ui/q_crop.mp3`,
  'crop.rice':             `${BASE}/ui/crop_rice.mp3`,
  'crop.potato':           `${BASE}/ui/crop_potato.mp3`,
  'crop.maize':            `${BASE}/ui/crop_maize.mp3`,
  'q.location':            `${BASE}/ui/q_location.mp3`,
  'opt.field':             `${BASE}/ui/opt_field.mp3`,
  'opt.homestead':         `${BASE}/ui/opt_homestead.mp3`,
  'q.part':                `${BASE}/ui/q_part.mp3`,
  'part.leaf':             `${BASE}/ui/part_leaf.mp3`,
  'part.stem':             `${BASE}/ui/part_stem.mp3`,
  'part.fruit':            `${BASE}/ui/part_fruit.mp3`,
  'part.root':             `${BASE}/ui/part_root.mp3`,
  'part.whole':            `${BASE}/ui/part_whole.mp3`,
  'q.symptom':             `${BASE}/ui/q_symptom.mp3`,
  'sym.spots':             `${BASE}/ui/sym_spots.mp3`,
  'sym.yellowing':         `${BASE}/ui/sym_yellowing.mp3`,
  'sym.wilting':           `${BASE}/ui/sym_wilting.mp3`,
  'sym.holes':             `${BASE}/ui/sym_holes.mp3`,
  'sym.powdery':           `${BASE}/ui/sym_powdery.mp3`,
  'sym.rot':               `${BASE}/ui/sym_rot.mp3`,
  'sym.insect':            `${BASE}/ui/sym_insect.mp3`,
  'q.candidates':          `${BASE}/ui/q_candidates.mp3`,
  'escape.label':          `${BASE}/ui/escape_label.mp3`,
  'candidates.broad':      `${BASE}/ui/candidates_broad.mp3`,
  'q.confirm':             `${BASE}/ui/q_confirm.mp3`,
  'opt.yes':               `${BASE}/ui/opt_yes.mp3`,
  'opt.no':                `${BASE}/ui/opt_no.mp3`,
  'gate.unlock':           `${BASE}/ui/gate_unlock.mp3`,
  'gate.fail':             `${BASE}/ui/gate_fail.mp3`,
  'sec.what':              `${BASE}/ui/sec_what.mp3`,
  'sec.spread':            `${BASE}/ui/sec_spread.mp3`,
  'sec.immediate':         `${BASE}/ui/sec_immediate.mp3`,
  'sec.nonchem':           `${BASE}/ui/sec_nonchem.mp3`,
  'sec.chem':              `${BASE}/ui/sec_chem.mp3`,
  'sec.safety':            `${BASE}/ui/sec_safety.mp3`,
  'sec.related_tips':      `${BASE}/ui/sec_related_tips.mp3`,
  'chem.phi':              `${BASE}/ui/chem_phi.mp3`,
  'chem.unverified':       `${BASE}/ui/chem_unverified.mp3`,
  'cam.title':             `${BASE}/ui/cam_title.mp3`,
  'cam.too_dark':          `${BASE}/ui/cam_too_dark.mp3`,
  'cam.too_bright':        `${BASE}/ui/cam_too_bright.mp3`,
  'cam.hold_steady':       `${BASE}/ui/cam_hold_steady.mp3`,
  'cam.blurry':            `${BASE}/ui/cam_blurry.mp3`,
  'cam.move_closer':       `${BASE}/ui/cam_move_closer.mp3`,
  'cam.move_back':         `${BASE}/ui/cam_move_back.mp3`,
  'cam.one_leaf':          `${BASE}/ui/cam_one_leaf.mp3`,
  'cam.centre':            `${BASE}/ui/cam_centre.mp3`,
  'cam.ready':             `${BASE}/ui/cam_ready.mp3`,
  'cam.capture_anyway':    `${BASE}/ui/cam_capture_anyway.mp3`,
  'cam.retake':            `${BASE}/ui/cam_retake.mp3`,
  'cam.use_photo':         `${BASE}/ui/cam_use_photo.mp3`,
  'ask.intro':             `${BASE}/ui/ask_intro.mp3`,
  'ask.photo1':            `${BASE}/ui/ask_photo1.mp3`,
  'ask.promise':           `${BASE}/ui/ask_promise.mp3`,
  'problem.rice_blast.name': `${BASE}/problems/rice_blast_name.mp3`,
}

let current: HTMLAudioElement | null = null

export function play(key: string): void {
  const src = AUDIO_MAP[key]
  if (!src) return

  if (current) {
    current.pause()
    current.currentTime = 0
  }

  current = new Audio(src)
  current.play().catch(() => {
    // Autoplay blocked — user must interact first; silent fail is correct here
  })
}

export function stop(): void {
  if (current) {
    current.pause()
    current.currentTime = 0
    current = null
  }
}

export function getPath(key: string): string | undefined {
  return AUDIO_MAP[key]
}
