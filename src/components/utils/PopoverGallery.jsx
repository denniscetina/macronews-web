import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

export default function PopoverGallery(props){
	const { isOpen, setIsOpen, src, alt, toggleScroll } = props;
	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-100"
					onClick={() => {
						setIsOpen(false);
					}}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<motion.div
						className="relative max-w-[1310px] max-h-[80vh] w-full flex justify-center"
						onClick={(e) => e.stopPropagation()} // evita cerrar al dar click en la imagen
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						<button
							type="button"
							className="absolute cursor-pointer top-4 right-4 text-white text-2xl font-bold px-4"
							onClick={() => {
								setIsOpen(false);
								toggleScroll(true);
							}}
						>
							✕
						</button>
						<motion.div
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.98 }}
							transition={{ duration: 0.4 }}
							className="w-full h-full"
						>
							<Image
								src={src}
								alt={alt}
								width={1310}
								height={800}
								className="w-full max-h-[80vh] h-full object-cover rounded-lg shadow-lg px-4"
							/>
						</motion.div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
