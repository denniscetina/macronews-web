import Link from 'next/link';

// Componente simplificado para manejar enlaces internos y externos.
export default function FooterLink({ link, className }) {
    const { url = "/", label, target } = link;
    const isExternal = target === '_blank' || url.startsWith('http');

    const defaultClassName = className || 'hover:underline text-secondary body-medium';

    if (isExternal) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={defaultClassName}
            >
                {label}
            </a>
        );
    }

    return (
        <Link prefetch={false} href={`/${url}`} className={defaultClassName}>
            {label}
        </Link>
    );
}

