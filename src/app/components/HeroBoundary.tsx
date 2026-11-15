"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Isolates the WebGL hero.
 *
 * `three` throws `Error creating WebGL context.` on clients where WebGL is
 * unavailable (hardware blocklists, some VDI/remote sessions, hardened
 * browsers), and React Three Fiber rethrows it out of `<Canvas>`. Without a
 * local boundary that error reaches Next's root boundary and replaces the whole
 * page — hero, gallery, and contact form included — with the generic error
 * screen. The canvas is purely decorative (`aria-hidden`), so the correct
 * degradation is to drop it and keep the page.
 */
export default class HeroBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Worth surfacing in the console: the page still works, so this is easy to
    // miss otherwise. No third-party reporting is configured.
    console.warn("Hero 3D scene disabled: WebGL is unavailable.", error.message);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
