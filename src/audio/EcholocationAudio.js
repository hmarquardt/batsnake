// @ts-check
/** Echolocation audio is synthesized by AudioManager; this facade preserves a replacement boundary. */
export class EcholocationAudio { constructor(audio){this.audio=audio;}emit(position){this.audio.chirp(position);} }
