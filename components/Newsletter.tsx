"use client";

import React, { startTransition, useActionState } from 'react';
import { subscribeNewsletter, SubscriptionResult } from '@/app/actions';
import styles from './Newsletter.module.css';

const initialState: SubscriptionResult = {
  success: false,
  message: "",
  error: ""
};

export default function Newsletter() {
  const [state, formAction, isPending] = useActionState(subscribeNewsletter, initialState);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <section id="newsletter" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.card}>
          
          <div className={styles.content}>
            <span className={styles.tagline}>THE JOURNAL</span>
            <h2 className={styles.title}>Subscribe to Deeksha</h2>
            <p className={styles.description}>
              Receive monthly musings on mindful design, slow rituals, aromatherapy tips, and exclusive early access to our hand-poured seasonal collections.
            </p>

            {state?.success ? (
              <div className={styles.successMessage}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.successIcon}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <p>{state.message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputWrapper}>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Enter your email address" 
                    required 
                    className={styles.input}
                    disabled={isPending}
                    aria-label="Email Address"
                  />
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={isPending}
                    aria-label="Subscribe"
                  >
                    {isPending ? (
                      <span className={styles.spinner}></span>
                    ) : (
                      <span className={styles.btnText}>
                        Join Journal
                        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 5h16M13 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
                
                {state?.error && (
                  <p className={styles.errorMessage} role="alert">
                    {state.error}
                  </p>
                )}
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
