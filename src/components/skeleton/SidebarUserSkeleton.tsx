export default function SidebarUserSkeleton() {
	return (
		<div className="my-3 py-4 px-4 border-b border-gray-300 shadow-smb animate-pulse">
			<div className="h-6 bg-gray-200 w-28 rounded my-2"></div>
			<div className="flex gap-4 place-items-center">
				<div className="flex flex-1 gap-1 flex-col">
					<div className="h-4 bg-gray-200 rounded"></div>
					<div className="h-4 bg-gray-200 rounded"></div>
				</div>
				<div className="flex gap-2">
					<div className="size-8 rounded-full bg-gray-200"></div>
					<div className="size-8 rounded-full bg-gray-200"></div>
				</div>
			</div>
		</div>
	);
}
