import React, { useRef, useState } from 'react';
import { Dropdown as AntDropdown, DropDownProps } from 'antd';

/**
 * This is built on top of AntD `Dropdown` to add some accessibility features
 */
const Dropdown: React.FC<DropDownProps> = ({ children, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const dropdownWrapperRef = useRef<HTMLDivElement>(null);
  return (
    // We disable this eslint rule here since the wrapper isn't interactive per say but more a "catch all"
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      onKeyDown={(e) => {
        const listRoot = document.activeElement?.parentElement;
        if (e.key === 'Escape' || (
          // if we tab away from our element
          e.key === 'Tab' && listRoot?.contains(document.activeElement)
        )) {
          setIsVisible(false);
          return;
        }
        if (listRoot != null) {
          if (e.key === 'ArrowDown') {
            const nextButton = listRoot?.nextSibling?.firstChild as (HTMLButtonElement | null);
            if (nextButton != null) {
              nextButton.focus();
            } else {
              // Focus the first element of the dropdown list
              (listRoot?.parentElement?.firstChild?.firstChild as HTMLButtonElement).focus();
            }
          } else if (e.key === 'ArrowUp') {
            const previousButton = listRoot?.previousSibling?.firstChild as (HTMLButtonElement | null);
            if (previousButton != null) {
              previousButton.focus();
            } else {
              // Focus the last element of the dropdown list
              (listRoot?.parentElement?.lastChild?.firstChild as HTMLButtonElement).focus();
            }
          }
        }
      }}
      ref={dropdownWrapperRef}
    >
      <AntDropdown
        trigger={['click']}
        getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
        onVisibleChange={(visible) => {
          // We are using a setTimeout here so it "waits" for the overlay to mount
          setTimeout(() => {
            // Focus the first element of the dropdown list
            (dropdownWrapperRef.current?.querySelectorAll('li')?.[0].firstChild as HTMLButtonElement).focus();
          }, 1);
          setIsVisible(visible);
        }}
        visible={isVisible}
        {...props}
      >
        { children }
      </AntDropdown>
    </div>
  );
};

export default Dropdown;
