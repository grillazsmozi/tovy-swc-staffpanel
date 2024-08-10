// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import { User } from '@/types/index.d'
import { PrismaClient } from '@prisma/client'
import * as noblox from 'noblox.js'
import { withSessionRoute } from '@/lib/withSession'
import * as bcrypt from 'bcrypt'
const prisma = new PrismaClient()
import { setRegistry } from '@/utils/registryManager'

function getUserID(name: string): Promise<string> {
    return new Promise((res, rej) => {
        fetch(`https://www.roblox.com/users/profile?username=${name}`)
            .then(r => {
                // check to see if URL is invalid.
                if (!r.ok) { throw "Invalid response"; }
                // return the only digits in the URL "the User ID"
                const match = r.url.match(/\d+/);
                if (match) {
                    return match[0];
                } else {
                    throw "No user ID found in URL";
                }
            })
            .then(id =>{
                // this is where you get your ID
                console.log(id);
                res(id);
            })
            .catch(error => rej(error));
    });
}

type Data = {
	success: boolean
	error?: string
	user?: User
}

type requestData = {
	groupid: number
	username: string;
}

export default withSessionRoute(handler)

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

	let useridold = await getUserID(req.body.username)

	console.log(`getUserID returned: ${useridold}`);

	let userid = parseInt(useridold, 10);

	console.log(`Parsed userid: ${userid}`);

	if (!userid) {
		res.status(404).json({ success: false, error: 'Username not found' })
		return
	};
	const workspaceCount = await prisma.workspace.count({})
	if (workspaceCount > 0) {
		res.status(403).json({ success: false, error: 'Workspace already exists' })
		return
	}
	await prisma.workspace.create({
		data: {
			groupId: parseInt(req.body.groupid)
		}
	})
	await prisma.config.create({
		data: {
			key: "customization",
			workspaceGroupId: parseInt(req.body.groupid),
			value: {
				color: req.body.color
			}
		}
	});

	const role = await prisma.role.create({
		data: {
			workspaceGroupId: parseInt(req.body.groupid),
			name: "Admin",
			isOwnerRole: true,
			permissions: [
				'admin',
				'view_staff_config'
			]
		}
	});

	await prisma.user.create({
		data: {
			userid: userid,
			info: {
				create: {
					passwordhash: await bcrypt.hash(req.body.password, 10),
				}
			},
			isOwner: true,
			roles: {
				connect: {
					id: role.id
				}
			}
		}
	});

	req.session.userid = userid
	await req.session?.save()

	const user: User = {
		userId: req.session.userid,
		username: await getUsername(req.session.userid),
		displayname: await getDisplayName(req.session.userid),
		thumbnail: await getThumbnail(req.session.userid)
	}

	await setRegistry((req.headers.host as string))

	res.status(200).json({ success: true, user })
}
