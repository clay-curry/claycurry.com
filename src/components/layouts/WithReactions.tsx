import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import Reactions from '@/components/Reactions';
import type { ReactionsProps } from '@/components/Reactions';

function WithTableOfContentsMock({ children = null }: PropsWithChildren) {
  return (
    <div className={clsx('content-wrapper')}>
      <div className={clsx('flex flex-row-reverse gap-8', 'xl:gap-24')}>
        <div className={clsx('-mt-48 hidden', 'lg:block')}>
          {/* mock table of contents width */}
          <div className={clsx('w-64', 'xl:w-[272px]')} />
        </div>
        <div className={clsx('min-w-0 flex-1')}>{children}</div>
        <div className={clsx('hidden', ' lg:block')} />
      </div>
    </div>
  );
}

function WithReactions(props: ReactionsProps) {
  return (
    <div
      className={clsx(
        'pointer-events-none sticky bottom-8 mt-16',
        'lg:bottom-8 lg:mt-24',
        'fm:static'
      )}
    >
      <WithTableOfContentsMock>
        <div
          className={clsx(
            'mx-auto max-w-[360px] px-4',
            'sm:max-w-[420px] sm:px-0'
          )}
        >
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Reactions {...props} />
        </div>
      </WithTableOfContentsMock>
    </div>
  );
}

export default WithReactions;
