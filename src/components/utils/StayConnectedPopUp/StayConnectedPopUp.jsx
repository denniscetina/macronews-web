"use client"
import { motion } from "framer-motion";
// helpers
import isEmpty from "lodash/isEmpty";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
// request
import { subscribeToNewsletter } from "@/api";
// Icons
import iconClose from "@/assets/img/icon-close.svg";
import placeholderImage from "@/assets/img/placeholder-image.png";
import { useRecaptcha } from "@/hooks/useRecaptcha";
// hooks
import useStore from "@/hooks/useStore";
import { context } from "@/Layout";
import { sanitizeHtml } from "../SanitizeHtml/SanitizeHtml";
// Components
import { fields, renderField } from "./RenderField";

export default function StayConnectedPopUp({ onClose }) {
	const { acfOptions } = useStore();
	const {
		footerNewsLetter: { popUpStayConnected },
	} = acfOptions();

	const {
		featureImagePopUp,
		logoPopUp,
		titlePopUp,
		submitButtonPopUp,
		descriptionPopUp,
	} = popUpStayConnected;
	const safeHtml = sanitizeHtml(descriptionPopUp);
	const [loading, setLoading] = useState(false);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid },
	} = useForm({ mode: "onChange", reValidateMode: "onChange" });
	const { lenisInstance } = useContext(context);

	const { verified, RenderRecaptcha } = useRecaptcha({ renderInModal: true });

	const onSubmit = async (data) => {
		setLoading(true);
		try {
			const response = await subscribeToNewsletter(data);
			setTimeout(() => {
				setLoading(false);
				reset();
				onClose();
			}, 3000);
		} catch (error) {
			console.error("Subscription error:", error.response?.data || error);
		}
	};

	useEffect(() => {
		lenisInstance.stop();
		document.documentElement.style.overflow = "hidden";
		return () => {
			lenisInstance.start();
			document.documentElement.style.overflow = "";
			const container = document.getElementById("recaptcha-singUp");
			if (container) container.innerHTML = "";
		};
	}, [lenisInstance]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 flex items-center justify-center z-[499] w-screen h-screen bg-black/40 backdrop-blur-md p-4"
		>
			<section className="relative bg-alt flex flex-col items-start w-[90vw] md:w-[95vw] lg:w-[75vw]">
				<div className="flex flex-col justify-center items-center self-stretch">
					<div className="grid grid-cols-1 md:grid-cols-2 w-full h-full overflow-hidden">
						<div className="relative hidden md:block py-8 px-8">
							<img
								src={featureImagePopUp.url || placeholderImage}
								alt={featureImagePopUp.alt || "featureImage"}
								className="w-full h-full object-cover"
							/>
						</div>
						<div>
							<div className="flex w-full justify-end p-4">
								<button
									type="button"
									className="cursor-pointer"
									onClick={onClose}
								>
									<img src={iconClose} alt="closeIcon" />
								</button>
							</div>
							<div className="flex flex-col items-center text-center px-16 pb-4 pt-2">
								<img
									src={logoPopUp.url}
									alt={logoPopUp.alt || "logo"}
									className="relative lg:w-10 lg:h-10 w-8 h-8 mb-2"
								/>
								<h4 className="text-secondary font-glosa font-medium text-xl md:text-xl lg:text-2xl leading-tight">
									{titlePopUp}
								</h4>
								<div className="py-8">
									<form onSubmit={handleSubmit(onSubmit)}>
										{fields.map((field) =>
											renderField(field, errors, register),
										)}
										<button
											type="submit"
											className={`bg-accent border-1 border-secondary w-full px-4 py-2 hover:cursor-pointer transition-colors hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed ${loading ? "hover:cursor-progress" : ""}`}
											disabled={!isValid || !verified}
										>
											{loading ? "Sending..." : submitButtonPopUp}
										</button>

										<div
											className={`transition-all duration-200 overflow-hidden w-full my-2 max-h-40`}
										>
											{!isEmpty(errors) && (
												<div
													className="w-full p-4 text-sm text-red-800 rounded-md border border-red-200 bg-red-50"
													role="alert"
												>
													<span className="font-medium mr-2">Error: </span>
													{Object.values(errors).map((err, idx) => (
														<span key={idx}>{err.message}</span>
													))}
												</div>
											)}
										</div>
									</form>
									{RenderRecaptcha}
								</div>
								<div
									className="wysiwyg sm:px-6"
									dangerouslySetInnerHTML={{ __html: safeHtml }}
								/>
							</div>
							<div className="flex w-full justify-end p-4" />
						</div>
					</div>
				</div>
			</section>
		</motion.div>
	);
}
