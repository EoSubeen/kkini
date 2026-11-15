"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import {
  signInAction,
  signUpAction,
  type AuthActionState,
} from "@/app/auth/actions";

const initialState: AuthActionState = {};

export function AuthForm({
  mode,
  next = "/home",
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const signup = mode === "signup";
  const action = signup ? signUpAction : signInAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <>
      <div className="auth-brand">
        <div className="auth-brand__lockup" aria-label="끼니">
          <Image src="/kkini/logo-symbol.png" alt="" width={54} height={50} priority />
          <strong>끼니</strong>
        </div>
        <p>세대 사이 끼인 당신을 위한 맞춤형 재무설계</p>
      </div>
      <form className="auth-card" action={formAction}>
        <h1>{signup ? "끼니 시작하기" : "다시 만났어요"}</h1>
        <p>{signup ? "계정을 만든 뒤 약속과 목표를 확인하고 재무 정보를 입력해요." : "저장해 둔 우리 집 재무 흐름을 이어서 확인하세요."}</p>
        {signup ? (
          <div className="form-field">
            <label htmlFor="displayName">부를 이름</label>
            <input id="displayName" name="displayName" autoComplete="nickname" placeholder="예: 김샌드" required />
          </div>
        ) : null}
        <div className="form-field">
          <label htmlFor="email">이메일</label>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="name@example.com" required />
        </div>
        {!signup ? <input type="hidden" name="next" value={next} /> : null}
        {state.error ? (
          <p className="notice notice--warn" role="alert" aria-live="polite">
            {state.error}
          </p>
        ) : null}
        <div className="form-field">
          <label htmlFor="password">비밀번호</label>
          <input id="password" name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={8} placeholder="8자 이상 입력" required />
        </div>
        <button className="button" type="submit" disabled={pending} aria-busy={pending}>
          {pending ? "확인 중…" : signup ? "계정 만들기" : "로그인"}
        </button>
        <div className="auth-links">
          <span>{signup ? "이미 계정이 있나요?" : "처음 오셨나요?"}</span>
          <Link href={signup ? "/login" : "/signup"}>{signup ? "로그인" : "회원가입"}</Link>
        </div>
      </form>
    </>
  );
}
