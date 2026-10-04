import { defineSignal } from '@temporalio/workflow';

export type Email = {
  message: string;
  title?: string;
  type: 'success' | 'fail' | 'info';
  // Product name for the digest subject. Workflow code cannot read the
  // environment, and digests live forever through continueAsNew, so the name
  // rides on every signal rather than on the workflow's start arguments.
  brand?: string;
};

export const emailSignal = defineSignal<[Email[]]>('email');
