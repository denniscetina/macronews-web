import clsx from "clsx";
export default function FormAlert(props){
	const { type = "error", message = "" } = props
	return(
		<div
			role="alert"
			className={clsx(
				"flex justify-center self-stretch w-full p-4 my-4 mx-6 text-sm rounded-lg",
				type === "error" && "text-red-800 bg-red-50",
				type === "success" && "text-green-800 bg-green-50",
			)}
		>
			<span>
				{message}
			</span>
		</div>
	)
}