// Drawer.js

import React from 'react';
import { useDrawerState } from '../state/useDrawerState';

const Drawer = ({ onClose }) => {
    const { data,resetData } = useDrawerState();
    const handleClose = ()=>{
        resetData();
        onClose?.()
    }
    return (
    <div className={`fixed inset-0 overflow-hidden z-50 ${data?.isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleClose}></div>
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="relative w-screen max-w-md">
            <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
              <div className="px-4 sm:px-6">
                <h2>Clicked from : ${data?.clickedFrom}</h2>
                <h6>content : ${data?.content}</h6>

                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Drawer Content</h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onClick={handleClose}
                    >
                      <span className="sr-only">Close panel</span>
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 relative flex-1 px-4 sm:px-6">
                {/* Replace with your content */}
                <div className="h-full border-2 border-dashed border-gray-200">
                  {/* Your content here */}
                  <p className="text-sm text-gray-500">
                    Replace with your drawer content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Drawer;
