import { useEffect } from "react";

export default function useLenisPreventOnSelectMenus() {
	useEffect(() => {
		const addLenisPrevent = () => {
			const menuLists = document.querySelectorAll(".react-select__menu-list");
			menuLists.forEach((menuList) => {
				if (menuList && !menuList.hasAttribute("data-lenis-prevent")) {
					menuList.setAttribute("data-lenis-prevent", "true");
				}
			});
		};

		const observer = new MutationObserver(addLenisPrevent);
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		addLenisPrevent();

		return () => observer.disconnect();
	}, []);
}
