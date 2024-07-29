import {useToast} from "@/components/ui/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import BaseSidebarLayout from "./_layout";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {ClipboardList, Trash2} from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { dateTimePretty } from "@/lib/dateTimeUtils";
  

const schema = z.object({
	role: z.string().min(2),
    company: z.string().min(2),
    application_detail_url: z.string().url().optional(),
    portal_url: z.string().url().optional(),
    date: z.string()
});

export default function JobApplicationTrackerTool() {
	const [jobApps, setJobApps] = useLocalStorage<z.infer<typeof schema>[]>("job_tracker_applications", []);
	const {toast} = useToast();

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
        defaultValues: {
            date: new Date().toISOString(),
        },
		mode: "all"
	});
	const onSubmit: SubmitHandler<z.infer<typeof schema>> = (data) => {
		if (!jobApps.find((t) => t.role+t.company === data.role+data.company)){
			setJobApps([...jobApps, data]);
		}
		toast({
			description: "Job application has been added!",
		});
	}

	return (
		<BaseSidebarLayout title="Job Application Tracker">
            <div className="m-8 flex flex-col lg:flex-row">
                <h1 className="text-2xl flex-1 font-bold tracking-tight">Job Application Tracking Tool</h1>
            </div>
            <div className="flex flex-col xl:flex-row m-8 gap-4 max-w-[2000px]">
                <div className="flex-1 order-2 xl:order-1 bg-white shadow-md dark:bg-zinc-900 rounded-xl">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Role</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Links</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobApps.map((application, index) => (
                                <TableRow key={application.role+application.company+application.date}>
                                    <TableCell className="font-medium min-w-[200px]">{application.role}</TableCell>
                                    <TableCell>{application.company}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{dateTimePretty(application.date)}</TableCell>
                                    <TableCell className="flex place-items-center w-full gap-4">
                                        <div className="flex-1 text-sm text-muted-foreground">
                                            {application.application_detail_url && application.application_detail_url.length > 0 ? 
                                                <a href={application.application_detail_url} target="_blank">Application Link</a> 
                                                :
                                                <></>
                                            }
                                            {" • "}
                                            {application.portal_url && application.portal_url.length > 0 ? 
                                                <a href={application.portal_url} target="_blank">Portal Link</a> 
                                                :
                                                <></>
                                            }
                                        </div>
                                        <Button 
                                            variant={"ghost"} 
                                            className="bg-zinc-200 dark:bg-zinc-800 hover:bg-destructive dark:hover:bg-destructive hover:text-white aspect-square !p-1 size-7"
                                            onClick={() => {
                                                let newArr = jobApps.slice();
                                                newArr.splice(index, 1);
                                                setJobApps(newArr);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                            <TableCell colSpan={3}>Total</TableCell>
                            <TableCell className="text-right">{jobApps.length} applications</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
                <div className="flex order-1 xl:order-2 w-full xl:w-80 mx-auto place-items-center">
                    <div className="w-full p-6 bg-white shadow-md dark:bg-zinc-900 rounded-xl">
                        <h2 className="text-xl font-bold tracking-tight">Add Application</h2>
                        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                            Enter details to add to the tracker
                        </p>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-4">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jr Software Engineer" {...field} />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Microsoft" {...field} />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="application_detail_url"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Application URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://linkedin.com/job/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="portal_url"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Portal URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://myworkday.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="p-px"></div>
                            <Button
                                variant="default"
                                type="submit"
                                className="flex-1 flex gap-2 w-full"
                            >
                                <ClipboardList className="size-4" />
                                <span>Save to browser</span>
                            </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
		</BaseSidebarLayout>
	);
}