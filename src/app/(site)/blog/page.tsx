import type { Metadata } from 'next';
import { allPosts } from 'contentlayer/generated';

import PostPreview from '~/app/(site)/blog/components/PostPreview';
import GridList from '~/app/(site)/components/GridList';
import Container from '~/core/ui/Container';
import SubHeading from '~/core/ui/SubHeading';

import configuration from '~/configuration';
import Heading from '~/core/ui/Heading';

export const metadata: Metadata = {
  title: `Blog - ${configuration.site.siteName}`,
  description: `Tutorials, Guides and Updates from our team`,
};

async function BlogPage() {
  return (
    <Container>
      <div className={'flex flex-col space-y-16 my-8'}>
        <div className={'flex flex-col items-center space-y-4'}>
          <Heading type={1}>Blog</Heading>

          <SubHeading>Explore our expert reviews, tips, and guides to find the perfect IPL solution for your skin.</SubHeading>
        </div>

        <GridList>
          {allPosts.map((post, idx) => {
            return <PostPreview key={idx} post={post} />;
          })}
        </GridList>
      </div>
    </Container>
  );
}

export default BlogPage;
