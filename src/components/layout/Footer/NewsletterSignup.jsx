//'use client';
//import { useState } from 'react';
import Image from 'next/image';
//import StayConnectedPopUp from '@/components/modules/StayConnectedPopUp/StayConnectedPopUp';
import ShapeOrange from '@/assets/img/shape-orange.svg';

export default function NewsletterSignup({ newsletter = {} }) {
    //const [isPopupVisible, setPopupVisible] = useState(false);
	const { newsletterTriggerSettings = { }, logoSingUpFooter } = newsletter ?? {};
	const newsletterPopupEnabled = false
	const { heading, description } = newsletterTriggerSettings;
    return (
        <div className="flex flex-col items-center w-64">
            <Image src={logoSingUpFooter?.url || ShapeOrange} alt="Newsletter Icon" width={32} height={32} className="mb-2" />
            <div className="flex flex-col gap-3 mb-4 items-center">
                <span className="text-center header-base text-secondary">{heading}</span>
                <div
                    className="wysiwyg hidden lg:flex font-futura text-form text-base text-center"
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            </div>
            {
				//TODO: enable newsletter popup
				/*
				newsletterPopupEnabled &&
                <button
                    onClick={() => setPopupVisible(true)}
                    type="button"
                    className="w-full cursor-pointer border border-secondary rounded py-3 text-secondary uppercase tracking-widest font-futura hover:bg-secondary hover:text-alt transition duration-300"
                >
                    {newsletterTriggerSettings.triggerButtonText}
                </button>
				*/
            }
            {/*{isPopupVisible && <StayConnectedPopUp onClose={() => setPopupVisible(false)} />}*/}
        </div>
    );
}
