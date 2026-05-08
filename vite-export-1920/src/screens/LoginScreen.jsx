import { useState } from 'react';
import { IllusLogo } from '../components/Illustrations.jsx';
import { Button, TextField } from '../components/MoimUI.jsx';
import { IKakao, IGoogle } from '../components/Icons.jsx';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  return (
    <div className="moim paper-grain" style={{
      width: '100%', height: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      padding: '60px 24px 32px',
      background: 'linear-gradient(180deg, var(--paper-100) 0%, var(--paper-50) 50%)',
    }}>
      <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 36 }}>
        <div style={{ display: 'inline-block', marginBottom: 18, filter: 'drop-shadow(0 8px 16px rgba(200,105,74,0.25))' }}>
          <IllusLogo size={88}/>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.035em', marginBottom: 8 }}>모임</h1>
        <p style={{ fontSize: 14.5, color: 'var(--ink-500)', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.5 }}>
          소중한 사람들과<br/>특별한 순간을 함께
        </p>
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--paper-200)',
        borderRadius: 'var(--r-xl)', padding: 22,
        boxShadow: 'var(--shadow-2)', flex: 1,
      }}>
        <TextField label="이메일" value={email} onChange={setEmail} placeholder="example@moim.kr"/>
        <TextField label="비밀번호" value={pw} onChange={setPw} placeholder="비밀번호 입력" type="password"/>
        <Button variant="primary" size="lg" full>로그인</Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--paper-200)' }}/>
          <span style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>또는 소셜 로그인</span>
          <span style={{ flex: 1, height: 1, background: 'var(--paper-200)' }}/>
        </div>

        <button style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', height: 52, borderRadius: 'var(--r-md)',
          background: '#FEE500', color: '#181600', border: 'none', cursor: 'pointer',
          fontSize: 15.5, fontWeight: 700, marginBottom: 10, fontFamily: 'inherit',
        }}>
          <IKakao size={20}/> 카카오로 시작하기
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', height: 52, borderRadius: 'var(--r-md)',
          background: 'var(--surface)', color: 'var(--ink-900)',
          border: '1.5px solid var(--paper-200)', cursor: 'pointer',
          fontSize: 15.5, fontWeight: 700, fontFamily: 'inherit',
        }}>
          <IGoogle size={20}/> 구글로 시작하기
        </button>
      </div>

      <div style={{ textAlign: 'center', paddingTop: 18, fontSize: 13.5, color: 'var(--ink-500)' }}>
        처음이신가요? <span style={{ color: 'var(--clay)', fontWeight: 700 }}>회원가입</span>
      </div>
    </div>
  );
}
