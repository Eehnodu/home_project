// 역할: 전역 타입 보강 — 브라우저 음성 인식 객체와 mp4 모듈 선언
/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  // 브라우저에 존재할 수 있는 전역 객체들
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }

  var webkitSpeechRecognition: any;
  var SpeechRecognition: any;
}

declare module "*.mp4" {
  const src: string;
  export default src;
}

export {};
