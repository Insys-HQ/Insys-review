/**
 * 인시스 공용 로그인 게이트 — auth-gate.js
 * v1.0 | 2026-08-26
 * 담당: 인시스 AI혁신 연구개발실
 *
 * 사번 + 비밀번호로 Firebase Authentication 로그인.
 * 로그인 전에는 body의 기존 콘텐츠를 전부 숨기고 로그인 오버레이만 표시.
 * 로그인 성공 시 오버레이 제거 + 기존 콘텐츠 노출 + 로그아웃 버튼 표시.
 *
 * 이 파일 하나만 관리하면 이를 참조하는 모든 페이지에 즉시 반영됩니다.
 * 계정 발급/관리는 admin_users.html (비공개 배포용) 사용.
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore, doc, setDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const INSYS_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBYqd2uRr1ZvFLDCWuS15h9qFkT-Dvg5Es",
  authDomain: "insys-work.firebaseapp.com",
  projectId: "insys-work",
  storageBucket: "insys-work.firebasestorage.app",
  messagingSenderId: "225275784859",
  appId: "1:225275784859:web:bd12815c6dc47c0c49e03e"
};

const EMAIL_DOMAIN = "insys-auth.local"; // 사번 -> 합성 이메일 변환용 도메인 (실사용 안 함)

const app = initializeApp(INSYS_FIREBASE_CONFIG, "authGateApp");
const auth = getAuth(app);
const db = getFirestore(app);

function empIdToEmail(empId) {
  return `${empId.trim().toLowerCase()}@${EMAIL_DOMAIN}`;
}

function buildOverlay() {
  if (document.getElementById('authGateOverlay')) return document.getElementById('authGateOverlay');
  const overlay = document.createElement('div');
  overlay.id = 'authGateOverlay';
  overlay.innerHTML = `
    <style>
      #authGateOverlay{position:fixed;inset:0;z-index:999999;background:#0f1c2e;
        display:flex;align-items:center;justify-content:center;
        font-family:'Noto Sans KR',sans-serif;}
      #authGateOverlay .ag-box{background:#fff;border-radius:12px;padding:36px 32px;
        width:320px;max-width:88vw;box-shadow:0 12px 32px rgba(0,0,0,.35);}
      #authGateOverlay h2{font-size:17px;color:#1f2d3d;margin:0 0 4px;}
      #authGateOverlay p.ag-sub{font-size:12px;color:#64748b;margin:0 0 18px;}
      #authGateOverlay input{width:100%;box-sizing:border-box;padding:11px 12px;
        margin-bottom:10px;border:1px solid #d1dbe8;border-radius:7px;font-size:14px;
        font-family:inherit;color:#1f2d3d;}
      #authGateOverlay button{width:100%;padding:11px;background:#1f2d3d;color:#fff;
        border:none;border-radius:7px;font-size:14px;font-family:inherit;
        cursor:pointer;margin-top:4px;}
      #authGateOverlay button:disabled{opacity:.6;cursor:default;}
      #authGateOverlay .ag-err{color:#dc2626;font-size:12px;margin-top:8px;min-height:14px;}
      #authGateOverlay .ag-ver{color:#94a3b8;font-size:10px;text-align:right;margin-top:14px;}
    </style>
    <div class="ag-box">
      <h2>인시스 사내 시스템</h2>
      <p class="ag-sub">사번과 비밀번호로 로그인하세요</p>
      <input id="agEmpId" type="text" placeholder="사번" autocomplete="username">
      <input id="agPw" type="password" placeholder="비밀번호" autocomplete="current-password">
      <button id="agLoginBtn">로그인</button>
      <div class="ag-err" id="agErr"></div>
      <div class="ag-ver">auth-gate v1.0</div>
    </div>
  `;
  document.body.prepend(overlay);
  return overlay;
}

function lockBody() {
  document.body.classList.add('auth-locked');
  if (!document.getElementById('authGateLockStyle')) {
    const style = document.createElement('style');
    style.id = 'authGateLockStyle';
    style.textContent = `body.auth-locked > *:not(#authGateOverlay){display:none !important;}`;
    document.head.appendChild(style);
  }
}
function unlockBody() {
  document.body.classList.remove('auth-locked');
  const overlay = document.getElementById('authGateOverlay');
  if (overlay) overlay.remove();
}

function ensureLogoutButton() {
  if (document.getElementById('agLogoutBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'agLogoutBtn';
  btn.textContent = '로그아웃';
  btn.style.cssText = 'position:fixed;top:8px;right:8px;z-index:999998;padding:6px 12px;'
    + 'background:#1f2d3d;color:#fff;border:none;border-radius:6px;font-size:11px;'
    + 'font-family:"Noto Sans KR",sans-serif;cursor:pointer;opacity:.85;';
  btn.onclick = () => signOut(auth);
  document.body.appendChild(btn);
}

async function logAccess(user) {
  try {
    await setDoc(doc(db, 'access_logs', `${Date.now()}_${user.uid}`), {
      uid: user.uid,
      email: user.email,
      page: location.pathname.split('/').pop() || 'index',
      ts: serverTimestamp()
    });
  } catch (e) {
    // 로그 실패는 접속 자체를 막지 않음 (무시)
  }
}

(function initAuthGate() {
  lockBody();
  const overlay = buildOverlay();
  const errEl = overlay.querySelector('#agErr');
  const btn = overlay.querySelector('#agLoginBtn');
  const empInput = overlay.querySelector('#agEmpId');
  const pwInput = overlay.querySelector('#agPw');

  async function doLogin() {
    const empId = empInput.value.trim();
    const pw = pwInput.value;
    if (!empId || !pw) { errEl.textContent = '사번과 비밀번호를 입력하세요.'; return; }
    btn.disabled = true; errEl.textContent = '';
    try {
      await signInWithEmailAndPassword(auth, empIdToEmail(empId), pw);
    } catch (e) {
      errEl.textContent = '사번 또는 비밀번호가 올바르지 않습니다.';
      btn.disabled = false;
    }
  }
  btn.addEventListener('click', doLogin);
  pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  empInput.addEventListener('keydown', e => { if (e.key === 'Enter') pwInput.focus(); });

  onAuthStateChanged(auth, user => {
    if (user) {
      unlockBody();
      ensureLogoutButton();
      logAccess(user);
    } else {
      lockBody();
      buildOverlay();
      const lb = document.getElementById('agLogoutBtn');
      if (lb) lb.remove();
    }
  });
})();
