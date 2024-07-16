import ThemeToggler from "@/components/utils/ThemeToggler";
import {BACKEND_ENDPOINT} from "@/config";
import {getPosts} from "@/services/api";
import {useQuery} from "@tanstack/react-query";

export default function Home() {
	const post_id = "7";
	const query = useQuery({queryKey: ["posts"], queryFn: () => getPosts(post_id)});

	return (
		<div className="container max-w-5xl px-4 py-4 mx-auto my-6">
			<div className="flex mb-8 place-items-center">
				<div className="flex-1">
					<h2 className="font-serif text-5xl font-black leading-8">RVTTS</h2>
					<span className="px-px text-sm text-muted-foreground">
						React + Vite + TanStack Query + Tailwind + shadcn
					</span>
				</div>
				<div>
					<ThemeToggler />
				</div>
			</div>
			<h4 className="my-3 mt-6 text-2xl font-black">Imports</h4>
			<p className="text-muted-foreground">
				Path <code>@/Example</code> is equivalent to <code>./src/Example</code>.
			</p>
			<h4 className="my-3 mt-6 text-2xl font-black">Hooks</h4>
			<p className="text-muted-foreground">
				Some useful hooks are provided in <code>/src/hooks</code>.
			</p>
			<h4 className="my-3 mt-6 text-2xl font-black">Services</h4>
			<p className="text-muted-foreground">
				An example of <code>axios</code> call is in <code>/src/services</code>.
				<br />
				This can be combined with <code>react-query</code> to do network requests, example in{" "}
				<code>/src/components/Home.tsx</code>.
			</p>
			<div className="flex px-2 mt-6 font-mono rounded-md bg-muted place-items-center">
				<div className="px-3 py-1 font-medium tracking-wide border-r text-muted-foreground border-r-muted-foreground/20">
					GET
				</div>
				<div className="px-3 text-sm tracking-tight">{BACKEND_ENDPOINT + "/posts/" + post_id}</div>
			</div>
			{query.isLoading ? (
				<>Fetching...</>
			) : query.isSuccess ? (
				<pre className="mt-2 mb-4 bg-muted">
					<code>{JSON.stringify(query.data, null, 2)}</code>
				</pre>
			) : query.isError ? (
				<>Error occured during fetching.</>
			) : (
				<></>
			)}
			<p>
				<a href="https://tanstack.com/query/latest/docs/framework/react/overview">
					See more about it here
				</a>
			</p>
			<h4 className="my-3 mt-6 text-2xl font-black">Types</h4>
			<p className="text-muted-foreground">
				Use <code>/src/types</code> for global types spanning whole project.
			</p>
			<h4 className="my-3 mt-6 text-2xl font-black">TailwindCSS and shadcn &#10003;</h4>
			<a href="https://ui.shadcn.com/docs">Check out shadcn here!</a>
		</div>
	);
}
