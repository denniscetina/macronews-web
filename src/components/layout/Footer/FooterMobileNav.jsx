'use client';

import { useState } from 'react';
import Image from 'next/image';
import chevronDown from '@/assets/img/chevron-down.svg';
import ContactLink from './ContactLink';
import FooterLink from './FooterLink';

export default function FooterMobileNav({ contactCol1, contactCol2, linksOne, linksTwo, labels = {} }) {
    const [isContactOpen, setContactOpen] = useState(false);
    const [isLinksOpen, setLinksOpen] = useState(false);
	const {
		contactUs = "Contact Us",
		linksOfInterest = "Links of Interest",
		expand = "expand",
	} = labels;

    return (
        <div className="order-3 flex flex-col gap-10 lg:hidden w-full">
            <div className="contact-us border-b border-b-secondary">
                <button
                    type="button"
                    className="text-start flex items-center justify-between w-full py-2"
                    onClick={() => setContactOpen(!isContactOpen)}
                >
                    <span className="header-base text-secondary">{contactUs}</span>
                    <Image 
                        src={chevronDown} 
                        alt={expand} 
                        className={`h-5 w-5 object-contain transition-transform duration-300 ${isContactOpen ? 'rotate-180' : ''}`} 
                    />
                </button>
                {isContactOpen && (
                    <div className="pt-2 pb-4 flex flex-col gap-2">
                        {contactCol1.map((info, index) => <ContactLink info={info} key={`c1-${index}`} />)}
                        {contactCol2.map((info, index) => <ContactLink info={info} key={`c2-${index}`} />)}
                    </div>
                )}
            </div>
            <div className="links-of-interest border-b border-b-secondary">
                <button
                    type="button"
                    className="text-start flex items-center justify-between w-full py-2"
                    onClick={() => setLinksOpen(!isLinksOpen)}
                >
                    <span className="header-base text-secondary">{linksOfInterest}</span>
                    <Image 
                        src={chevronDown} 
                        alt={expand} 
                        className={`h-5 w-5 object-contain transition-transform duration-300 ${isLinksOpen ? 'rotate-180' : ''}`} 
                    />
                </button>
                {isLinksOpen && (
                    <div className="pt-2 pb-4 flex flex-col gap-2">
                        {linksOne.map((link) => <FooterLink key={link.id} link={link} />)}
                        {linksTwo.map((link) => <FooterLink key={link.id} link={link} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
